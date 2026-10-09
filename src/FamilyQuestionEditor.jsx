import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function FamilyQuestionEditor({ questions, onChange }) {
  const edit = (index, patch) =>
    onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  return (
    <section className="family-question-editor" aria-label="Özel aile soruları">
      <div className="family-editor-summary">
        <strong>
          {questions.length} özel soru · {10 - questions.length} hazır soru
        </strong>
        <p>
          Kendini anlatan sorular yaz: “En sevdiğim kahvaltılık hangisi?” gibi.
          Kalan sorular havuzdan tamamlanır.
        </p>
        <p>
          Örnek şıklar doğru cevap değildir. Herkes kendi cevabını telefondan
          yazar; diğer aile üyelerinin cevapları yanlış şık olarak kullanılmaz.
        </p>
      </div>
      {questions.map((question, index) => (
        <fieldset key={index} className="family-custom-question">
          <legend>Özel soru {index + 1}</legend>
          <label>
            Sorun
            <textarea
              required
              minLength={5}
              maxLength={200}
              value={question.text}
              placeholder="En sevdiğim kahvaltılık hangisi?"
              onChange={(e) => edit(index, { text: e.target.value })}
            />
          </label>
          <div className="family-example-options">
            {question.examples.map((example, choice) => (
              <label key={choice}>
                Örnek şık {choice + 1}
                <input
                  required
                  maxLength={80}
                  value={example}
                  placeholder={["Menemen", "Simit", "Tost"][choice]}
                  onChange={(e) =>
                    edit(index, {
                      examples: question.examples.map((v, i) =>
                        i === choice ? e.target.value : v,
                      ),
                    })
                  }
                />
              </label>
            ))}
          </div>
          {questions.length > 1 && (
            <button
              type="button"
              className="text-btn"
              aria-label={`Özel soru ${index + 1} kaldır`}
              onClick={() => onChange(questions.filter((_, i) => i !== index))}
            >
              <Trash2 size={15} /> Soruyu kaldır
            </button>
          )}
        </fieldset>
      ))}
      {questions.length < 10 && (
        <button
          type="button"
          className="btn secondary full"
          onClick={() =>
            onChange([...questions, { text: "", examples: ["", "", ""] }])
          }
        >
          <Plus size={18} /> Özel soru ekle
        </button>
      )}
    </section>
  );
}
