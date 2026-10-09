"""Append the 2026 category expansion without changing legacy quiz records."""
from bank250_common import file_questions
from bank250_world import expand_world
from bank250_nature import expand_nature
from bank250_geography import expand_geography
from bank250_space import expand_space
from bank250_cars import expand_cars
from bank250_sports import expand_sports
from bank250_culture import expand_culture
from bank250_turkey import expand_turkey
from bank250_records import expand_records

CATEGORY_IDS = ('cografya','dinozor','hayvanlar','turkiye','meshur','plakalar',
                'ulkeler','bayraklar','enler','gezegenler','futbol','kaleciler',
                'arabalar','turkiye-tarihi','osmanli-tarihi','islam-tarihi',
                'peygamberler-tarihi','genel-kultur')

def extend_to_250(questions,add,provinces):
    expand_world(questions,add,provinces)
    for extend in (expand_nature,expand_geography,expand_space,expand_cars,
                   expand_sports,expand_culture,expand_turkey,expand_records):
        extend(questions,add)
    for category in CATEGORY_IDS:
        file_questions(add,category)
