// The English text table. Every string the player reads is here. Use {name} for a value.
export const EN = {
  // Items.
  'item.wood': 'Wood', 'item.stone': 'Stone', 'item.berries': 'Berries', 'item.rawFish': 'Raw fish',
  'item.cookedFish': 'Cooked fish', 'item.rawMeat': 'Raw meat', 'item.cookedMeat': 'Cooked meat',
  'item.axe': 'Stone axe', 'item.spear': 'Spear', 'item.tinder': 'Tinder', 'item.kindling': 'Kindling',
  'item.fibre': 'Plant fibre', 'item.rope': 'Rope', 'item.bandage': 'Bandage', 'item.stoneHead': 'Stone head',
  'item.handle': 'Handle',

  // Skills.
  'skill.foraging': 'Foraging', 'skill.labor': 'Labor', 'skill.fishing': 'Fishing', 'skill.crafting': 'Crafting',
  'skill.levelUp': '{skill} is now level {level}.',
  'skill.level': 'Lv {level}',

  // Recipes.
  'recipe.campfire.name': 'Campfire',
  'recipe.campfire.blurb': 'Warmth, light and a way to cook. Light it with tinder and kindling.',
  'recipe.cordage.name': 'Cordage', 'recipe.cordage.blurb': 'Twist plant fibre into rope.',
  'recipe.bandage.name': 'Bandage', 'recipe.bandage.blurb': 'Binds a cut or a sprain.',
  'recipe.stoneHead.name': 'Stone head', 'recipe.stoneHead.blurb': 'Chip a stone to an edge. Part of an axe or a spear.',
  'recipe.handle.name': 'Handle', 'recipe.handle.blurb': 'Trim a branch into a shaft. Part of an axe or a spear.',
  'recipe.axe.name': 'Stone axe', 'recipe.axe.blurb': 'Lash a stone head to a handle. Chops wood much faster.',
  'recipe.spear.name': 'Spear', 'recipe.spear.blurb': 'Lash a stone head to a handle. Lets you fish in the water.',
  'recipe.shelter.name': 'Lean-to', 'recipe.shelter.blurb': 'Keeps you warmer and rests you better.',

  // Things in the world, as they appear in messages.
  'noun.stone': 'rock', 'noun.tree': 'tree', 'noun.bush': 'bush', 'noun.fire': 'fire', 'noun.shelter': 'lean-to',
  'noun.deer': 'deer', 'noun.hare': 'hare', 'noun.shore': 'shore', 'noun.terrain': 'terrain', 'noun.thing': 'thing',
  'noun.structure': 'structure', 'noun.animal': 'animal',

  // Action labels.
  'action.drink': 'Drink', 'action.fish': 'Fish', 'action.forage': 'Pick berries', 'action.chop': 'Chop tree',
  'action.breakBranches': 'Break branches', 'action.tinder': 'Gather tinder', 'action.fibre': 'Strip fibre',
  'action.kindling': 'Gather kindling', 'action.mine': 'Gather stone', 'action.fuel': 'Feed fire',
  'action.light': 'Light fire', 'action.cook': 'Cook fish', 'action.cookMeat': 'Cook meat',
  'action.boil': 'Boil and drink', 'action.eat': 'Eat {item}', 'action.eatRotten': 'Eat rotten {item}',
  'action.discard': 'Throw away rotten {item}', 'action.craft': 'Make {recipe}', 'action.bandage': 'Bandage wound',
  'action.sleep': 'Sleep', 'action.hunt': 'Hunt {animal}',
  'action.cannot': 'You cannot do that right now.',

  // Why an action cannot be used.
  'blocked.packFull': 'pack is full', 'blocked.needsWood': 'needs wood',
  'blocked.needsLightingKit': 'needs tinder and kindling', 'blocked.fishRotted': 'fish has rotted',
  'blocked.meatRotted': 'meat has rotted', 'blocked.fireOut': 'the fire is out',
  'blocked.needsRawFish': 'needs raw fish', 'blocked.needsRawMeat': 'needs raw meat',
  'blocked.needsSpear': 'needs spear', 'blocked.notTired': 'not tired',
  'craft.haveOne': 'you have one', 'craft.needs': 'needs {list}',
  'craft.stoneWarning': 'This stone is for a campfire, which needs {need} stone. You will have {left} left.',

  // Messages after an action.
  'pack.tooFull': 'Your pack is too full.',
  'gather.got': 'You get {n} {item}.',
  'drink.foul': 'The water tastes foul. Your stomach turns. You feel sick.',
  'drink.fine': 'The water is cold. It tastes of salt and mud.',
  'fish.hit': 'You spear a fish.', 'fish.miss': 'The fish slip away.',
  'tinder.got': 'You pull dry grass from under the bush.',
  'fibre.got': 'You strip tough fibre from the bush stems.',
  'kindling.got': 'You snap dry twigs from the tree.',
  'fire.fed': 'The fire crackles.',
  'cook.fish': 'The fish sizzles.', 'cook.meat': 'The meat sizzles and smells good.',
  'boil.done': 'You boil water over the fire and drink it. It is safe.',
  'eat.rotten': 'The {item} is rotten. Your stomach turns. You feel sick.',
  'eat.sick': 'Your stomach turns. You feel sick.',
  'eat.ok': 'You eat the {item}.',
  'discard.done': 'You throw away the rotten {item}.',
  'craft.done': 'You make a {recipe}.',
  'sleep.start': 'You lie down and close your eyes.',

  // Fire and weather.
  'fire.rainRefusal': 'The rain is too heavy to light a fire out in the open.',
  'fire.caught': 'The tinder catches. A small flame grows.',
  'fire.dampFail': 'The damp tinder will not catch.',
  'fire.sparkFail': 'The spark dies. Nothing catches.',
  'fire.rainedOut': 'The rain puts out the fire.',
  'rain.start': 'Dark clouds open. Rain begins to fall.', 'rain.stop': 'The rain stops.',
  'wet.soaked': 'You are soaked through. The chill bites.', 'wet.dry': 'You are dry again.',

  // Wounds.
  'wound.bleeding': 'You cut yourself. The wound is bleeding.',
  'wound.sprain': 'You twist your ankle. Walking hurts.',
  'wound.infected': 'The wound is red and hot. It is infected, and you feel sick.',
  'wound.bleedStops': 'The bleeding stops on its own.', 'wound.ankleBetter': 'Your ankle feels better.',
  'wound.cleaned': 'You clean the wound and bind it. The infection fades.',
  'wound.boundCut': 'You bind the cut. The bleeding stops.', 'wound.boundAnkle': 'You bind your ankle. It holds.',

  // Walking, hunting and the survivor's body.
  'stall.cannotGet': 'You cannot get to {what}. The {blocker} is in the way.',
  'stall.cannotReach': 'You cannot reach {what}. The {blocker} is in the way.',
  'stall.spot': 'that spot', 'stall.water': 'the water', 'stall.the': 'the {noun}',
  'unstick.freed': 'You are wedged against the {what}. You step free.',
  'hunt.outOfReach': 'The animal is out of reach.',
  'hunt.miss': 'You throw the spear and miss the {animal}.',
  'hunt.killFull': 'You kill the {animal}, but your pack is too full to take any {item}.',
  'hunt.kill': 'You kill the {animal} and take {n} {item}.',
  'hunt.killPartial': 'You kill the {animal} and take {n} {item}, all you can carry.',
  'wear.broke': 'Your {item} breaks.',
  'rot.some': 'Some of your {item} has rotted.', 'rot.one': 'Your {item} has rotted.',
  'wake.rested': 'You wake up rested.', 'wake.cold': 'The cold wakes you up.',
  'wake.needs': 'Your body wakes you. You need water or food.',

  // Thirst hints.
  'thirst.here': 'You are thirsty. Water is right beside you.',
  'thirst.far': 'You are thirsty. Water lies {direction}, about {steps} steps away.',
  'dir.left': 'left', 'dir.right': 'right', 'dir.up': 'up', 'dir.down': 'down',
  'dir.diagonal': '{vertical} and to the {horizontal}',

  // Death.
  'death.thirst': 'died of thirst', 'death.hunger': 'starved', 'death.cold': 'froze to death',
  'death.exhaustion': 'collapsed from exhaustion', 'death.sickness': 'died of sickness',
  'death.bleeding': 'bled to death', 'death.other': 'died',
  'death.log': 'You {cause}.',
  'death.title': 'You {cause}',
  'death.lastedOne': 'You lasted {n} day.', 'death.lastedMany': 'You lasted {n} days.',
  'death.again': 'Wake up again',

  // Opening screen.
  'intro.title': 'This Day',
  'intro.wake': 'You wake up on cold ground. You do not know where you are.',
  'intro.goal': 'Find water. Find food. Keep warm when the sun goes down.',
  'intro.begin': 'Open your eyes',

  // HUD.
  'hud.pack': 'Pack', 'hud.make': 'Make', 'hud.skills': 'Skills',
  'hud.help': 'click the ground to walk · click an object for its actions · click the survivor to eat, sleep and make · wheel to zoom',
  'pack.empty': 'Empty', 'pack.load': 'Load', 'pack.loadFull': 'Load (full)', 'pack.loadHeavy': 'Load (heavy)',
  'pack.usesLeft': '({n} uses left)',
  'fresh.rotten': 'rotten', 'fresh.someRotten': '{n} rotten', 'fresh.rotsIn': 'rots in {n}h',
  'busy.sleeping': 'Sleeping…',
  'minutes': '{n}m',
  'clock.day': 'Day {n}', 'clock.sick': 'sick', 'clock.infected': 'infected', 'clock.bleeding': 'bleeding',
  'clock.sprained': 'sprained', 'clock.sheltered': 'sheltered', 'clock.raining': 'raining',
  'clock.soaked': 'soaked', 'clock.damp': 'damp',
} as const;

export type TextKey = keyof typeof EN;
export type Table = Record<TextKey, string>;
