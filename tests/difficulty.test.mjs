import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const bank = JSON.parse(
  readFileSync(new URL("../data/questions.json", import.meta.url)),
);
const levels = JSON.parse(
  readFileSync(new URL("../data/question-levels.json", import.meta.url)),
);
const general = new Set([
  ...Object.values(levels.generalQuestionIds).flat(),
  ...bank.filter((q) => q.difficulty === "general").map((q) => q.id),
]);

test("editorial general pools cover all 20 categories with stable IDs and room to rotate", () => {
  assert.equal(Object.keys(levels.generalQuestionIds).length, 20);
  assert.equal(
    new Set(Object.values(levels.generalQuestionIds).flat()).size,
    Object.values(levels.generalQuestionIds).flat().length,
  );
  for (const [category, ids] of Object.entries(levels.generalQuestionIds)) {
    assert(
      ids.length >= 36,
      `${category}: enough general questions for two full games`,
    );

    for (const id of ids)
      assert(
        bank.some((q) => q.id === id && q.category === category),
        id,
      );
  }
});

test("specialist detail stays out of general slots while familiar facts stay eligible", () => {
  for (const pattern of [
    "cinsinin ilk adlandırılmasına",
    "cins adının Türkçeye",
    "jeolojik dönemde yaşadı",
    "adlı yüzey oluşumu",
    "finalinde Real Madrid adına",
    "Perihel ne demektir",
    "Köçekçe",
    "Direksiyon ne işe yarar",
    "ayakları ve bacakları öncelikle",
    "Po hangi hayvandır",
  ]) {
    const matches = bank.filter((q) => q.text.includes(pattern));
    assert.equal(matches.length, 0, pattern);
  }
  for (const pattern of [
    "Kızıl Gezegen",
    "Dünya'nın en yüksek zirvesi",
    "Türkiye'nin en yüksek dağı",
    "Dinozorların nasıl çoğaldığını",
    "İstanbul'un Osmanlılar tarafından fethi",
  ]) {
    const q = bank.find((q) => q.text.includes(pattern));
    assert(q && general.has(q.id), pattern);
  }
});

function php(code) {
  return JSON.parse(
    execFileSync("php", ["-r", `require 'api/core.php';${code}`], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    }),
  );
}

test("old general questions retain nine slots when every expert question is unused; oldest entries rotate first", () => {
  const result = php(`
    $pool=[];$history=[];
    for($i=0;$i<18;$i++){$id='g'.$i;$pool[]=['id'=>$id,'difficulty'=>'general'];$history[$id]=100+$i;}
    for($i=0;$i<200;$i++)$pool[]=['id'=>'e'.$i,'difficulty'=>'expert'];
    $first=selectQuizQuestions($pool,$history);
    foreach($first as $q)$history[$q['id']]=1000;
    echo json_encode([$first,selectQuizQuestions($pool,$history)]);
  `);
  for (let turn = 0; turn < 2; turn++) {
    const selected = result[turn];
    assert.equal(selected.length, 10);
    assert.equal(new Set(selected.map((q) => q.id)).size, 10);
    assert.equal(selected.filter((q) => q.difficulty === "expert").length, 1);
    assert.deepEqual(
      selected
        .filter((q) => q.difficulty === "general")
        .map((q) => q.id)
        .sort(),
      Array.from({ length: 9 }, (_, i) => `g${i + turn * 9}`).sort(),
    );
  }
  assert.notEqual(
    result[0].find((q) => q.difficulty === "expert").id,
    result[1].find((q) => q.difficulty === "expert").id,
  );
});

test("selection never fills a missing general slot with another expert and permits a wholly general pool", () => {
  const result = php(`
    $g=[];for($i=0;$i<10;$i++)$g[]=['id'=>'g'.$i,'difficulty'=>'general'];
    $e=[];for($i=0;$i<10;$i++)$e[]=['id'=>'e'.$i];
    $errors=[];
    foreach([[array_merge(array_slice($g,0,8),$e),false],[array_merge(array_slice($g,0,8),array_slice($e,0,2)),true]] as [$pool,$manual]){
      try{selectQuizQuestions($pool,[],$manual);$errors[]=false;}catch(DomainException $e){$errors[]=true;}
    }
    echo json_encode(['errors'=>$errors,'automatic'=>selectQuizQuestions($g,[]),'manual'=>selectQuizQuestions($g,[],true)]);
  `);
  assert.deepEqual(result.errors, [true, true]);
  assert.equal(result.automatic.length, 10);
  assert.equal(result.manual.length, 10);
  assert(result.automatic.every((q) => q.difficulty === "general"));
});

test("every shipped question has an explicit editorial decision for its category", () => {
  const expected = new Map();
  for (const [key, difficulty] of [["generalQuestionIds", "general"], ["detailQuestionIds", "expert"]]) {
    for (const [category, ids] of Object.entries(levels[key])) {
      for (const id of ids) {
        assert(!expected.has(id), id);
        expected.set(id, {category, difficulty});
      }
    }
  }
  assert.equal(expected.size, bank.length);
  for (const q of bank) {
    assert.deepEqual(expected.get(q.id), {category: q.category, difficulty: q.difficulty ?? "general"});
  }
});
