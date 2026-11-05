// The Polish text table. It has every key of the English one. Names stay in the nominative,
// and sentences are built so no name needs another case. 'x.few' is the form for 2-4, 22-24, and so on.
import type { Table } from './en';

export const PL: Table = {
  // Items.
  'item.wood': 'Drewno', 'item.stone': 'Kamień', 'item.berries': 'Jagody', 'item.rawFish': 'Surowa ryba',
  'item.cookedFish': 'Pieczona ryba', 'item.rawMeat': 'Surowe mięso', 'item.cookedMeat': 'Pieczone mięso',
  'item.axe': 'Kamienny topór', 'item.spear': 'Włócznia', 'item.tinder': 'Podpałka', 'item.kindling': 'Rozpałka',
  'item.fibre': 'Włókno roślinne', 'item.rope': 'Lina', 'item.bandage': 'Bandaż', 'item.stoneHead': 'Kamienne ostrze',
  'item.handle': 'Drzewce',

  // Skills.
  'skill.foraging': 'Zbieractwo', 'skill.labor': 'Praca', 'skill.fishing': 'Rybołówstwo', 'skill.crafting': 'Rzemiosło',
  'skill.levelUp': 'Umiejętność {skill}: poziom {level}.',
  'skill.level': 'Poz. {level}',

  // Recipes.
  'recipe.campfire.name': 'Ognisko',
  'recipe.campfire.blurb': 'Ciepło, światło i sposób na gotowanie. Rozpal je podpałką i rozpałką.',
  'recipe.cordage.name': 'Sznur', 'recipe.cordage.blurb': 'Skręć włókno roślinne w linę.',
  'recipe.bandage.name': 'Bandaż', 'recipe.bandage.blurb': 'Opatruje skaleczenie lub skręcenie.',
  'recipe.stoneHead.name': 'Kamienne ostrze', 'recipe.stoneHead.blurb': 'Oszlifuj kamień na ostrze. Część topora lub włóczni.',
  'recipe.handle.name': 'Drzewce', 'recipe.handle.blurb': 'Ociosaj gałąź na kij. Część topora lub włóczni.',
  'recipe.axe.name': 'Kamienny topór', 'recipe.axe.blurb': 'Przywiąż ostrze do drzewca. Znacznie szybciej ścina drewno.',
  'recipe.spear.name': 'Włócznia', 'recipe.spear.blurb': 'Przywiąż ostrze do drzewca. Pozwala łowić ryby w wodzie.',
  'recipe.shelter.name': 'Szałas', 'recipe.shelter.blurb': 'Daje więcej ciepła i lepiej odpoczywasz.',

  // Things in the world, as they appear in messages.
  'noun.stone': 'skała', 'noun.tree': 'drzewo', 'noun.bush': 'krzak', 'noun.fire': 'ognisko', 'noun.shelter': 'szałas',
  'noun.deer': 'jeleń', 'noun.hare': 'zając', 'noun.shore': 'brzeg', 'noun.terrain': 'teren', 'noun.thing': 'rzecz',
  'noun.structure': 'budowla', 'noun.animal': 'zwierzę',

  // Action labels.
  'action.drink': 'Pij', 'action.fish': 'Łów ryby', 'action.forage': 'Zbierz jagody', 'action.chop': 'Zetnij drzewo',
  'action.breakBranches': 'Łam gałęzie', 'action.tinder': 'Zbierz podpałkę', 'action.fibre': 'Zdziel włókno',
  'action.kindling': 'Zbierz rozpałkę', 'action.mine': 'Zbierz kamień', 'action.fuel': 'Dorzuć do ognia',
  'action.light': 'Rozpal ogień', 'action.cook': 'Upiecz rybę', 'action.cookMeat': 'Upiecz mięso',
  'action.boil': 'Przegotuj i pij', 'action.eat': 'Zjedz: {item}', 'action.eatRotten': 'Zjedz zgniłe: {item}',
  'action.discard': 'Wyrzuć zgniłe: {item}', 'action.craft': 'Zrób: {recipe}', 'action.bandage': 'Opatrz ranę',
  'action.sleep': 'Śpij', 'action.hunt': 'Poluj: {animal}',
  'action.cannot': 'Nie możesz tego teraz zrobić.',

  // Why an action cannot be used.
  'blocked.packFull': 'plecak pełny', 'blocked.needsWood': 'potrzeba drewna',
  'blocked.needsLightingKit': 'potrzeba podpałki i rozpałki', 'blocked.fishRotted': 'ryba zgniła',
  'blocked.meatRotted': 'mięso zgniło', 'blocked.fireOut': 'ogień zgasł',
  'blocked.needsRawFish': 'potrzeba surowej ryby', 'blocked.needsRawMeat': 'potrzeba surowego mięsa',
  'blocked.needsSpear': 'potrzeba włóczni', 'blocked.notTired': 'brak senności',
  'craft.haveOne': 'już masz', 'craft.missing': '{item} ×{n}', 'craft.needs': 'brakuje: {list}',
  'craft.stoneWarning': 'Ten kamień jest potrzebny na ognisko, które wymaga kamieni: {need}. Zostanie ci: {left}.',

  // Messages after an action.
  'pack.tooFull': 'Twój plecak jest za pełny.',
  'gather.got': 'Zdobywasz: {item} ×{n}.',
  'drink.foul': 'Woda ma paskudny smak. Skręca cię w żołądku. Dopada cię choroba.',
  'drink.fine': 'Woda jest zimna. Smakuje solą i mułem.',
  'fish.hit': 'Trafiasz rybę włócznią.', 'fish.miss': 'Ryby wymykają się.',
  'tinder.got': 'Wyciągasz suchą trawę spod krzaka.',
  'fibre.got': 'Zdzierasz twarde włókno z łodyg krzaka.',
  'kindling.got': 'Łamiesz suche gałązki z drzewa.',
  'fire.fed': 'Ogień trzaska.',
  'cook.fish': 'Ryba skwierczy.', 'cook.meat': 'Mięso skwierczy i pachnie smakowicie.',
  'boil.done': 'Gotujesz wodę nad ogniem i pijesz ją. Jest bezpieczna.',
  'eat.rotten': 'To zgniłe: {item}. Skręca cię w żołądku. Dopada cię choroba.',
  'eat.sick': 'Skręca cię w żołądku. Dopada cię choroba.',
  'eat.ok': 'Jesz: {item}.',
  'discard.done': 'Wyrzucasz zgniłe: {item}.',
  'craft.done': 'Robisz: {recipe}.',
  'sleep.start': 'Kładziesz się i zamykasz oczy.',

  // Fire and weather.
  'fire.rainRefusal': 'Deszcz jest zbyt ulewny, by rozpalić ogień pod gołym niebem.',
  'fire.caught': 'Podpałka zajmuje się. Rośnie mały płomień.',
  'fire.dampFail': 'Wilgotna podpałka nie chce się zająć.',
  'fire.sparkFail': 'Iskra gaśnie. Nic się nie zajmuje.',
  'fire.rainedOut': 'Deszcz gasi ogień.',
  'rain.start': 'Ciemne chmury się otwierają. Zaczyna padać deszcz.', 'rain.stop': 'Deszcz ustaje.',
  'wet.soaked': 'Przemakasz do suchej nitki. Chłód kąsa.', 'wet.dry': 'Znów jest sucho.',

  // Wounds.
  'wound.bleeding': 'Rozcinasz się. Rana krwawi.',
  'wound.sprain': 'Skręcasz kostkę. Chodzenie boli.',
  'wound.infected': 'Rana jest czerwona i gorąca. Wdało się zakażenie. Dopada cię choroba.',
  'wound.bleedStops': 'Krwawienie samo ustaje.', 'wound.ankleBetter': 'Kostka boli mniej.',
  'wound.cleaned': 'Oczyszczasz ranę i opatrujesz ją. Zakażenie ustępuje.',
  'wound.boundCut': 'Opatrujesz skaleczenie. Krwawienie ustaje.', 'wound.boundAnkle': 'Bandażujesz kostkę. Trzyma.',

  // Walking, hunting and the survivor's body.
  'stall.cannotGet': 'Nie możesz dojść do {what}. Drogę blokuje: {blocker}.',
  'stall.cannotReach': 'Nie możesz dosięgnąć {what}. Drogę blokuje: {blocker}.',
  'stall.spot': 'tego miejsca', 'stall.water': 'wody', 'stall.the': 'celu: {noun}',
  'unstick.freed': 'Zahaczasz o: {what}. Odsuwasz się.',
  'hunt.outOfReach': 'Zwierzę jest poza zasięgiem.',
  'hunt.miss': 'Rzucasz włócznią i pudłujesz: {animal}.',
  'hunt.killFull': 'Zabijasz: {animal}, ale plecak jest za pełny na: {item}.',
  'hunt.kill': 'Zabijasz: {animal}. Bierzesz: {item} ×{n}.',
  'hunt.killPartial': 'Zabijasz: {animal}. Bierzesz: {item} ×{n}, tyle, ile uniesiesz.',
  'wear.broke': 'Łamie się: {item}.',
  'rot.some': 'Część zapasu zgniła: {item}.', 'rot.one': 'Zgniło: {item}.',
  'wake.rested': 'Budzisz się z nowymi siłami.', 'wake.cold': 'Budzi cię zimno.',
  'wake.needs': 'Ciało cię budzi. Potrzebujesz wody lub jedzenia.',

  // Thirst hints.
  'thirst.here': 'Chce ci się pić. Woda jest tuż obok.',
  'thirst.far.one': 'Chce ci się pić. Woda jest {direction}, około {steps} krok stąd.',
  'thirst.far.few': 'Chce ci się pić. Woda jest {direction}, około {steps} kroki stąd.',
  'thirst.far.other': 'Chce ci się pić. Woda jest {direction}, około {steps} kroków stąd.',
  'dir.left': 'w lewo', 'dir.right': 'w prawo', 'dir.up': 'w górę', 'dir.down': 'w dół',
  'dir.diagonal': '{vertical} i {horizontal}',

  // Death.
  'death.thirst': 'Umierasz z pragnienia', 'death.hunger': 'Umierasz z głodu', 'death.cold': 'Zamarzasz',
  'death.exhaustion': 'Padasz z wyczerpania', 'death.sickness': 'Umierasz z choroby',
  'death.bleeding': 'Wykrwawiasz się', 'death.other': 'Umierasz',
  'death.log': '{cause}.',
  'death.title': '{cause}',
  'death.lasted.one': 'Przetrwano {n} dzień.', 'death.lasted.other': 'Przetrwano {n} dni.',
  'death.again': 'Obudź się ponownie',

  // Opening screen.
  'intro.title': 'Ten dzień',
  'intro.wake': 'Budzisz się na zimnej ziemi. Nie wiesz, gdzie jesteś.',
  'intro.goal': 'Znajdź wodę. Znajdź jedzenie. Ogrzej się, gdy zajdzie słońce.',
  'intro.begin': 'Otwórz oczy',

  // HUD.
  'hud.language': 'EN', 'hud.languageLabel': 'Przełącz na angielski',
  'hud.pack': 'Plecak', 'hud.make': 'Rób', 'hud.skills': 'Umiejętności',
  'hud.help': 'kliknij ziemię, by iść · kliknij obiekt, by zobaczyć akcje · kliknij postać, by jeść, spać i robić · kółko myszy: zoom',
  'pack.empty': 'Pusty', 'pack.load': 'Ciężar', 'pack.loadFull': 'Ciężar (pełny)', 'pack.loadHeavy': 'Ciężar (duży)',
  'pack.usesLeft.one': '(zostało {n} użycie)', 'pack.usesLeft.few': '(zostały {n} użycia)',
  'pack.usesLeft.other': '(zostało {n} użyć)',
  'fresh.rotten': 'zgniłe', 'fresh.someRotten': 'zgniłych: {n}', 'fresh.rotsIn': 'psuje się za {n} godz.',
  'busy.sleeping': 'Śpisz…',
  'minutes': '{n} min',
  'clock.day': 'Dzień {n}', 'clock.sick': 'choroba', 'clock.infected': 'zakażenie', 'clock.bleeding': 'krwawienie',
  'clock.sprained': 'skręcenie', 'clock.sheltered': 'w schronieniu', 'clock.raining': 'deszcz',
  'clock.soaked': 'przemoczenie', 'clock.damp': 'wilgoć',
};
