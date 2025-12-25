export default {
  home: {
    subtitle: 'Conquer the Stars',
    startGame: 'Start Game',
    privacyAgreement: 'Privacy Agreement',
    privacyAgreementDesc: 'Please read and agree to our privacy policy before starting the game.',
    agreeToPrivacy: 'I have read and agree to',
    viewFullPolicy: 'View Full Policy',
    agreeAndStart: 'Agree & Start'
  },
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    resourceType: 'Resource Type',
    playerName: 'Commander',
    featureLocked: 'Feature Locked',
    unlockRequired: 'Building Required',
    requiredBuilding: 'Required Building',
    currentLevel: 'Current Level',
    goToBuildings: 'Go to Buildings',
    locked: 'Locked',
    viewRequirements: 'View Requirements',
    requirementsNotMet: 'Requirements Not Met',
    current: 'Current',
    level: 'Level',
    to: 'to',
    gmModeActivated: 'GM Mode Activated! Check the navigation menu.',
    view: 'View',
    viewDetails: 'View Details',
    exitConfirmTitle: 'Exit Game',
    exitConfirmMessage: 'Are you sure you want to exit? Your progress is saved automatically.',
    points: 'Points',
    retry: 'Retry'
  },
  errors: {
    requirementsNotMet: 'Requirements not met',
    insufficientResources: 'Insufficient resources',
    insufficientFleetStorage: 'Insufficient fleet storage',
    shieldDomeLimit: 'Shield dome limit reached',
    missileSiloLimit: 'Missile silo capacity exceeded',
    insufficientMissiles: 'Insufficient interplanetary missiles',
    invalidMissileCount: 'Invalid missile count',
    targetOutOfRange: 'Target out of range',
    cannotAttackOwnPlanet: 'Cannot attack your own planet',
    fleetMissionsFull: 'Fleet mission slots full',
    insufficientFleet: 'Insufficient fleet',
    insufficientFuel: 'Insufficient fuel',
    planetOnly: 'This building can only be built on planets',
    moonOnly: 'This building can only be built on moons',
    buildQueueFull: 'Build queue full',
    insufficientSpace: 'Insufficient space',
    buildingLevelZero: 'Building level is 0, cannot demolish',
    researchQueueFull: 'Research queue full',
    moonExists: 'Moon already exists',
    insufficientDebris: 'Insufficient debris field',
    launchFailed: 'Launch failed'
  },
  nav: {
    overview: 'Overview',
    buildings: 'Buildings',
    research: 'Research',
    shipyard: 'Shipyard',
    defense: 'Defense',
    fleet: 'Fleet',
    officers: 'Officers',
    simulator: 'Simulator',
    galaxy: 'Galaxy',
    diplomacy: 'Diplomacy',
    achievements: 'Achievements',
    campaign: 'Campaign',
    ranking: 'Ranking',
    messages: 'Messages',
    settings: 'Settings',
    gm: 'GM'
  },
  sidebar: {
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    collapse: 'Collapse',
    expand: 'Expand'
  },
  resources: {
    metal: 'Metal',
    crystal: 'Crystal',
    deuterium: 'Deuterium',
    darkMatter: 'Dark Matter',
    energy: 'Energy',
    production: 'Production',
    consumption: 'Consumption',
    capacity: 'Capacity',
    current: 'Current',
    max: 'Max Capacity',
    perHour: 'hour',
    perMinute: 'min',
    hour: 'hour',
    noEnergy: 'No Energy',
    temperatureBonus: 'Temperature Bonus'
  },
  energy: {
    lowWarning: 'Energy deficit! Resource production stopped!',
    deficitDetail: 'Energy deficit: {deficit}, build more power plants',
    buildSolarPlant: 'Build Power Plant'
  },
  oreDeposit: {
    lowWarning: 'Ore deposits running low!',
    depletedWarning: 'Ore deposits depleted!',
    depletedResources: 'Depleted: {resources}',
    lowResources: 'Running low: {resources}'
  },
  planet: {
    moon: 'Moon',
    position: 'Position',
    switchToMoon: 'View Moon',
    backToPlanet: 'Back to Planet',
    switchPlanet: 'Switch Planet',
    currentPlanet: 'Current Planet',
    temperature: 'Temperature',
    homePlanet: 'Home Planet',
    planetPrefix: 'Planet',
    colonyPrefix: 'Colony',
    renamePlanet: 'Rename Planet',
    renamePlanetTitle: 'Rename Planet',
    planetNamePlaceholder: 'Enter new planet name',
    rename: 'Rename'
  },
  player: {
    points: 'Total Points'
  },
  buildings: {
    metalMine: 'Metal Mine',
    crystalMine: 'Crystal Mine',
    deuteriumSynthesizer: 'Deuterium Synthesizer',
    solarPlant: 'Solar Plant',
    fusionReactor: 'Fusion Reactor',
    roboticsFactory: 'Robotics Factory',
    naniteFactory: 'Nanite Factory',
    shipyard: 'Shipyard',
    hangar: 'Hangar',
    researchLab: 'Research Lab',
    metalStorage: 'Metal Storage',
    crystalStorage: 'Crystal Storage',
    deuteriumTank: 'Deuterium Tank',
    darkMatterCollector: 'Dark Matter Collector',
    darkMatterTank: 'Dark Matter Tank',
    missileSilo: 'Missile Silo',
    terraformer: 'Terraformer',
    lunarBase: 'Lunar Base',
    sensorPhalanx: 'Sensor Phalanx',
    jumpGate: 'Jump Gate',
    planetDestroyerFactory: 'Planet Destroyer Factory',
    geoResearchStation: 'Geological Research Station',
    deepDrillingFacility: 'Deep Drilling Facility',
    buildTime: 'Build Time',
    production: 'Production',
    consumption: 'Consumption',

    storageCapacity: 'Capacity',
    energyProduction: 'Energy Production',
    fleetStorage: 'Fleet Storage',
    buildQueueBonus: 'Build Queue',
    spaceBonus: 'Space Bonus',
    buildSpeedBonus: 'Build Speed Bonus',

    missileCapacity: 'Missile Capacity',

    // Ore deposits
    oreDeposit: 'Ore Deposit',
    remainingDeposit: 'Remaining',
    depletionTime: 'Est. Depletion',
    depositDepleted: 'Depleted',
    depositWarning: 'Warning: Ore deposits are running low (below 10%)!',
    depositDepletedMessage: 'Ore deposits have been exhausted. Production has stopped.'
  },
  buildingDescriptions: {
    metalMine: 'Extracts metal resources',
    crystalMine: 'Extracts crystal resources',
    deuteriumSynthesizer: 'Synthesizes deuterium (higher output in cold temperatures)',
    solarPlant: 'Provides energy',
    fusionReactor: 'Uses deuterium to generate large amounts of energy',
    roboticsFactory: 'Accelerates construction speed',
    naniteFactory: 'Increases build queue capacity, +1 per level (max 10 levels)',
    shipyard: 'Constructs ships',
    hangar: 'Specialized facility for expanding fleet storage capacity, supports planetary specialization',
    researchLab: 'Researches technologies',
    metalStorage: 'Increases metal storage capacity',
    crystalStorage: 'Increases crystal storage capacity',
    deuteriumTank: 'Increases deuterium storage capacity',
    darkMatterCollector: 'Collects rare dark matter resources',
    darkMatterTank: 'Increases dark matter storage capacity',
    missileSilo: 'Stores and launches missiles, 10 missiles per level',
    terraformer: 'Terraforms planet surface, adds 30 available space per level',
    lunarBase: 'Increases available space on the moon, +30 space per level',
    sensorPhalanx: 'Detects fleet activities in surrounding systems',
    jumpGate: 'Instantly transfers fleets to other moons',
    planetDestroyerFactory: 'Constructs ultimate weapons capable of destroying planets',
    geoResearchStation: 'Researches geological structures and increases ore deposit regeneration rate. +50% regeneration per level',
    deepDrillingFacility: 'Drills deep into the crust to access deeper ore veins. +20% ore deposit capacity per level'
  },
  ships: {
    lightFighter: 'Light Fighter',
    heavyFighter: 'Heavy Fighter',
    cruiser: 'Cruiser',
    battleship: 'Battleship',
    battlecruiser: 'Battlecruiser',
    bomber: 'Bomber',
    destroyer: 'Destroyer',
    smallCargo: 'Small Cargo',
    largeCargo: 'Large Cargo',
    colonyShip: 'Colony Ship',
    recycler: 'Recycler',
    espionageProbe: 'Espionage Probe',
    solarSatellite: 'Solar Satellite',
    darkMatterHarvester: 'Dark Matter Harvester',
    deathstar: 'Deathstar'
  },
  shipDescriptions: {
    lightFighter: 'Basic combat unit',
    heavyFighter: 'Heavily armored fighter',
    cruiser: 'Medium warship, balanced offense and defense',
    battleship: 'Main heavy warship with powerful firepower and strong defense',
    battlecruiser: 'Fast powerful warship, excels at attacking battleships',
    bomber: 'Specialized ship for attacking defense structures',
    destroyer: 'Specialized anti-capital ship with high firepower but low defense',
    smallCargo: 'Transports small amounts of resources',
    largeCargo: 'Transports large amounts of resources',
    colonyShip: 'Used to colonize new planets',
    recycler: 'Collects debris field resources',
    espionageProbe: 'Scouts enemy planets',
    solarSatellite: 'Provides extra energy, output based on planet temperature (higher in hot climates)',
    darkMatterHarvester: 'Special ship for harvesting dark matter',
    deathstar: 'Ultimate weapon capable of destroying entire planets'
  },
  defenses: {
    rocketLauncher: 'Rocket Launcher',
    lightLaser: 'Light Laser',
    heavyLaser: 'Heavy Laser',
    gaussCannon: 'Gauss Cannon',
    ionCannon: 'Ion Cannon',
    plasmaTurret: 'Plasma Turret',
    smallShieldDome: 'Small Shield Dome',
    largeShieldDome: 'Large Shield Dome',
    antiBallisticMissile: 'Anti-Ballistic Missile',
    interplanetaryMissile: 'Interplanetary Missile',
    planetaryShield: 'Planetary Shield'
  },
  defenseDescriptions: {
    rocketLauncher: 'Basic defense facility',
    lightLaser: 'Light energy weapon',
    heavyLaser: 'Heavy energy weapon',
    gaussCannon: 'High-speed kinetic weapon',
    ionCannon: 'Effective against shields',
    plasmaTurret: 'Powerful defense facility',
    smallShieldDome: 'Small shield protecting the entire planet',
    largeShieldDome: 'Large shield protecting the entire planet',
    antiBallisticMissile: 'Intercepts enemy missiles, can intercept 1 interplanetary missile each',
    interplanetaryMissile: 'Can attack defense structures on other planets',
    planetaryShield: 'Super shield protecting planet from destruction attacks'
  },
  research: {
    researchTime: 'Research Time',

    attackBonus: 'Attack Bonus',
    shieldBonus: 'Shield Bonus',
    armorBonus: 'Armor Bonus',
    spyLevel: 'Spy Level',
    researchQueueBonus: 'Research Queue',
    colonySlots: 'Colony Slots',
    forAllPlanets: '(Global)',
    speedBonus: 'Speed Bonus'
  },
  technologies: {
    energyTechnology: 'Energy Technology',
    laserTechnology: 'Laser Technology',
    ionTechnology: 'Ion Technology',
    hyperspaceTechnology: 'Hyperspace Technology',
    plasmaTechnology: 'Plasma Technology',
    computerTechnology: 'Computer Technology',
    espionageTechnology: 'Espionage Technology',
    weaponsTechnology: 'Weapons Technology',
    shieldingTechnology: 'Shielding Technology',
    armourTechnology: 'Armour Technology',
    astrophysics: 'Astrophysics',
    gravitonTechnology: 'Graviton Technology',
    combustionDrive: 'Combustion Drive',
    impulseDrive: 'Impulse Drive',
    hyperspaceDrive: 'Hyperspace Drive',
    darkMatterTechnology: 'Dark Matter Technology',
    terraformingTechnology: 'Terraforming Technology',
    planetDestructionTech: 'Planet Destruction Technology',
    miningTechnology: 'Mining Technology'
  },
  technologyDescriptions: {
    energyTechnology: 'Improves energy efficiency',
    laserTechnology: 'Foundation of laser weapons and defense',
    ionTechnology: 'Ion weapon technology',
    hyperspaceTechnology: 'Hyperspace jump technology',
    plasmaTechnology: 'Plasma weapon technology',
    computerTechnology: 'Increases research queue and fleet mission slots, +1 queue +1 slot per level (max 10 levels)',
    espionageTechnology:
      'Improves spy probe effectiveness, +1 espionage level per level. Spy level = your level - enemy level + probes/5. ≥-1 shows fleet, ≥1 shows defense, ≥3 shows buildings, ≥5 shows technologies',
    weaponsTechnology: 'Increases ship and defense attack power by 10% per level',
    shieldingTechnology: 'Increases ship and defense shields by 10% per level',
    armourTechnology: 'Increases ship and defense armour by 10% per level',
    astrophysics: 'Each level adds 1 colony slot and increases expedition success rate',
    gravitonTechnology: 'Studies graviton manipulation, required for Death Star',
    combustionDrive: 'Basic propulsion technology',
    impulseDrive: 'Intermediate propulsion technology',
    hyperspaceDrive: 'Advanced propulsion technology',
    darkMatterTechnology: 'Research into dark matter properties and applications',
    terraformingTechnology: 'Research planet terraforming technology, adds 30 available space to all planets per level',
    planetDestructionTech: 'Terrifying technology for destroying entire planets',
    miningTechnology: 'Improves mining methods and equipment, increases ore deposit capacity on all planets. +15% capacity per level'
  },
  officers: {
    commander: 'Commander',
    admiral: 'Admiral',
    engineer: 'Engineer',
    geologist: 'Geologist',
    technocrat: 'Technocrat',
    darkMatterSpecialist: 'Dark Matter Specialist',
    resourceBonus: 'Resource Production Bonus',
    darkMatterBonus: 'Dark Matter Production Bonus',
    energyBonus: 'Energy Production Bonus'
  },
  officerDescriptions: {
    commander: 'Improves building speed and management',
    admiral: 'Improves fleet combat and speed',
    engineer: 'Improves energy and defense',
    geologist: 'Improves resource production',
    technocrat: 'Improves research speed and espionage',
    darkMatterSpecialist: 'Improves dark matter collection efficiency'
  },
  queue: {
    title: 'Active Tasks',
    empty: 'No active queues',
    buildQueueBonus: 'Build Queue',
    spaceBonus: 'Space Bonus',
    buildSpeedBonus: 'Build Speed Bonus',
    researchSpeedBonus: 'Research Speed Bonus',
    researchQueueBonus: 'Research Queue',
    building: 'Building',
    researching: 'Researching',
    demolishing: 'Demolishing',
    remaining: 'Remaining',
    cancel: 'Cancel',
    cancelBuild: 'Cancel Build',
    cancelResearch: 'Cancel Research',
    confirmCancel: 'Are you sure you want to cancel? 50% of resources will be refunded.',
    level: 'Level',
    quantity: 'Quantity',
    upgradeToLevel: 'Upgrade to Level',
    tabs: {
      all: 'All',
      buildings: 'Buildings',
      research: 'Research',
      ships: 'Ships',
      defense: 'Defense',
      waiting: 'Waiting'
    },
    waitingEmpty: 'No waiting tasks',
    addToWaiting: 'Add to Waiting Queue',
    remove: 'Remove',
    resourcesReady: 'Ready',
    waitingResources: 'Waiting',
    waitingQueueFull: 'Waiting queue is full',
    movedToQueue: 'Task moved to queue'
  },
  overview: {
    resourceOverview: 'Resources',
    fleetInfo: 'Fleet',
    currentShips: 'Ships on this planet',
    totalProduction: 'Total Production',
    totalConsumption: 'Total Consumption',
    noConsumption: 'No energy consumption',
    tabOverview: 'Overview',
    tabProduction: 'Production Details',
    tabConsumption: 'Consumption Details'
  },
  buildingsView: {
    title: 'Buildings',
    spaceUsage: 'Space Usage',
    upgradeCost: 'Upgrade Cost',
    upgrade: 'Upgrade',
    maxLevelReached: 'Max Level Reached',
    requirementsNotMet: 'Requirements Not Met',
    upgradeFailed: 'Upgrade Failed',
    upgradeFailedMessage: 'Please check if you have enough resources, space, or if there are other build tasks.',
    demolish: 'Demolish',
    demolishRefund: 'Demolish Refund',
    demolishFailed: 'Demolish Failed',
    demolishFailedMessage: 'Unable to demolish this building. Please check if the build queue is full or the building level is 0.',
    confirmDemolish: 'Confirm Demolish'
  },
  researchView: {
    title: 'Research',
    researchCost: 'Research Cost',
    research: 'Research',
    maxLevelReached: 'Max Level Reached',
    researchFailed: 'Research Failed',
    researchFailedMessage: 'Please check if you have enough resources, prerequisites are met, or if there are other research tasks.'
  },
  shipyard: {
    missileAttack: 'Missile Attack',
    speed: 'Speed',
    cargoCapacity: 'Cargo Capacity',
    fuelConsumption: 'Fuel Consumption'
  },
  shipyardView: {
    title: 'Shipyard',
    fleetStorage: 'Fleet Storage',
    attack: 'Attack',
    missileAttack: 'Missile Attack',
    shield: 'Shield',
    speed: 'Speed',
    cargoCapacity: 'Cargo Capacity',
    unitCost: 'Unit Cost',
    buildQuantity: 'Build Quantity',
    totalCost: 'Total Cost',
    build: 'Build',
    inputError: 'Input Error',
    inputErrorMessage: 'Please enter build quantity!',
    buildFailed: 'Build Failed',
    buildFailedMessage: 'Please check if you have enough resources or if prerequisites are met.'
  },
  defense: {
    missileAttack: 'Missile Attack'
  },
  defenseView: {
    title: 'Defense',
    attack: 'Attack',
    missileAttack: 'Missile Attack',
    shield: 'Shield',
    armor: 'Armor',
    buildTime: 'Build Time',
    seconds: 's',
    unitCost: 'Unit Cost',
    buildQuantity: 'Build Quantity',
    totalCost: 'Total Cost',
    build: 'Build',
    shieldDomeBuilt: 'Shield dome already built',
    missileCapacity: 'Missile Capacity',
    inputError: 'Input Error',
    inputErrorMessage: 'Please enter build quantity!',
    buildFailed: 'Build Failed',
    buildFailedMessage: 'Please check if you have enough resources or if prerequisites are met. Shield domes can only be built once.'
  },
  fleetView: {
    title: 'Fleet Management',
    fleetOverview: 'Fleet Overview',
    sendFleet: 'Send Fleet',
    flightMissions: 'Flight Missions',
    currentPlanetFleet: 'Current Planet Fleet',
    attack: 'Attack',
    missileAttack: 'Missile Attack',
    shield: 'Shield',
    armor: 'Armor',
    speed: 'Speed',
    cargo: 'Cargo',
    selectFleet: 'Select Fleet',
    selectFleetDescription: 'Select the number of ships to send',
    available: 'Available',
    all: 'All',
    targetCoordinates: 'Target Coordinates',
    targetType: 'Target Type',
    planet: 'Planet',
    moon: 'Moon',
    galaxy: 'Galaxy',
    system: 'System',
    position: 'Position',
    missionType: 'Mission Type',
    missionInfo: 'Mission Info',
    fuelConsumption: 'Fuel Consumption',
    flightTime: 'Flight Time',
    attackMission: 'Attack',
    transport: 'Transport',
    colonize: 'Colonize',
    spy: 'Spy',
    deploy: 'Deploy',
    expedition: 'Expedition',
    expeditionZone: 'Expedition Zone',
    expeditionZoneDesc: 'Select destination zone. Different zones have different risks and rewards',
    requiresAstro: 'Requires Astrophysics level {level}',
    reward: 'Reward',
    danger: 'Danger',
    zones: {
      nearSpace: {
        name: 'Near Space',
        desc: 'Safe near-space area, low risk but fewer rewards'
      },
      deepSpace: {
        name: 'Deep Space',
        desc: 'Far from stars, more resources may be found'
      },
      unchartedSpace: {
        name: 'Uncharted Space',
        desc: 'Unexplored area, high risk high reward'
      },
      dangerousNebula: {
        name: 'Dangerous Nebula',
        desc: 'Nebula full of unknown dangers, but contains extremely rich treasures'
      }
    },
    recycle: 'Recycle',
    destroy: 'Planet Destruction',
    transportResources: 'Transport Resources',
    totalCargoCapacity: 'Total Cargo Capacity',
    used: 'Used',
    noFlightMissions: 'No flight missions',
    outbound: 'Outbound',
    returning: 'Returning',
    fleetComposition: 'Fleet Composition',
    carryingResources: 'Carrying Resources',
    arrivalTime: 'Arrival Time',
    returnTime: 'Return Time',
    recallFleet: 'Recall Fleet',
    abortMission: 'Abort Mission',
    abortMissionTitle: 'Confirm Abort Mission',
    abortMissionWarning:
      'WARNING: Aborting this mission will permanently lose {ships} ships and {resources} resources!\n\nThis action is irreversible and the fleet and resources will not return.',
    abortMissionSuccess: 'Mission Aborted',
    abortMissionSuccessMessage: 'Mission has been aborted, fleet and resources are lost.',
    sendFailed: 'Send Failed',
    sendFailedMessage: 'Please check fleet count, fuel availability, or cargo capacity limits.',
    recallFailed: 'Recall Failed',
    recallFailedMessage: 'This mission cannot be recalled.',
    unknownPlanet: 'Unknown Planet',
    fleetMissionSlots: 'Fleet Mission Slots',
    noShipsSelected: 'No ships selected',
    cannotSendToOwnPlanet: 'Cannot send fleet to your own planet',
    cargoExceedsCapacity: 'Cargo exceeds capacity',
    noColonyShip: 'Colony ship required for colonization mission',
    noDebrisAtTarget: 'No debris field at target coordinates or debris field is empty',
    noDeathstar: 'Deathstar required for destruction mission',
    giftMode: 'Gift Mode',
    giftModeDescription: 'Send resources as a gift to',
    estimatedReputationGain: 'Estimated reputation gain',
    // Fleet presets
    fleetPresets: 'Fleet Presets',
    fleetPresetsDescription: 'Save common fleet configurations for quick dispatch (max 3)',
    savePreset: 'Save Preset',
    noPresets: 'No presets yet, select fleet and click "Save Preset" to create',
    shipTypes: 'ship types',
    editPreset: 'Edit preset content',
    renamePreset: 'Rename',
    deletePreset: 'Delete preset',
    editingPresetHint: 'Editing preset, modify fleet configuration and click "Save" to update',
    presetLimitReached: 'Preset limit reached',
    presetLimitReachedMessage: 'Maximum of {max} presets allowed',
    presetError: 'Save failed',
    presetNoShips: 'Please select at least one ship first',
    presetDefaultName: 'Preset {number}',
    savePresetTitle: 'Save Fleet Preset',
    savePresetDescription: 'Name this fleet configuration',
    renamePresetTitle: 'Rename Preset',
    renamePresetDescription: 'Enter a new preset name',
    presetName: 'Preset Name',
    presetNamePlaceholder: 'Enter preset name',
    deletePresetTitle: 'Delete Preset',
    deletePresetMessage: 'Are you sure you want to delete preset "{name}"? This action cannot be undone.',
    // Jump Gate
    jumpGate: 'Jump Gate',
    jumpGateDescription: 'Use the Jump Gate to instantly transfer fleet to another moon with Jump Gate',
    jumpGateNotAvailable: 'Jump Gate Not Available',
    jumpGateRequiresMoon: 'Jump Gate can only be used on moons',
    jumpGateNotBuilt: 'Current moon does not have a Jump Gate',
    jumpGateCooldown: 'Jump Gate Cooling Down',
    jumpGateCooldownRemaining: 'Cooldown Remaining',
    jumpGateReady: 'Jump Gate Ready',
    jumpGateSelectTarget: 'Select Target Moon',
    jumpGateNoTargetMoons: 'No available target moons (requires Jump Gate and cooldown complete)',
    jumpGateSelectFleet: 'Select Fleet to Transfer',
    jumpGateTransfer: 'Transfer Fleet',
    jumpGateSuccess: 'Jump Gate Transfer Successful',
    jumpGateSuccessMessage: 'Fleet has been instantly transferred to {target}',
    jumpGateFailed: 'Jump Gate Transfer Failed',
    jumpGateFailedMessage: 'Please check Jump Gate status and fleet configuration'
  },
  officersView: {
    title: 'Officers',
    activated: 'Activated',
    inactive: 'Inactive',
    activeStatus: 'Active Status',
    expirationTime: 'Expiration Time',
    remainingTime: 'Remaining Time',
    recruitCost: 'Recruitment Cost',
    days: 'days',
    benefitsBonus: 'Benefits Bonus',
    resourceProduction: 'Resource Production',
    darkMatterProduction: 'Dark Matter Production',
    buildingSpeed: 'Building Speed',
    researchSpeed: 'Research Speed',
    fleetSpeed: 'Fleet Speed',
    fuelConsumption: 'Fuel Consumption',
    defense: 'Defense',
    storageCapacity: 'Storage Capacity',
    buildQueue: 'Build Queue',
    spaceBonus: 'Space Bonus',
    buildSpeedBonus: 'Build Speed Bonus',
    researchSpeedBonus: 'Research Speed Bonus',
    fleetSlots: 'Fleet Slots',
    hire: 'Hire',
    renew: 'Renew',
    dismiss: 'Dismiss',
    hireTitle: 'Hire Officer',
    hireMessage: 'Are you sure you want to hire {name}? Valid for 7 days.',
    renewTitle: 'Renew Officer',
    renewMessage: 'Are you sure you want to renew {name} for 7 days?',
    dismissTitle: 'Dismiss Officer',
    dismissMessage: 'Are you sure you want to dismiss {name}? No refunds will be given.',
    hireFailed: 'Hire Failed',
    renewFailed: 'Renew Failed',
    insufficientResources: 'Insufficient resources!'
  },
  galaxyView: {
    title: 'Galaxy',
    selectCoordinates: 'Select Coordinates',
    galaxy: 'Galaxy',
    selectGalaxy: 'Select Galaxy',
    system: 'System',
    selectSystem: 'Select System',
    myPlanets: 'View My Systems',
    npcPlanets: 'NPC Planets',
    selectPlanetToView: 'Select planet to view its system',
    totalPositions: '10 planet positions total',
    mine: 'Mine',
    emptySlot: 'Empty - Colonizable',
    scout: 'Scout',
    attack: 'Attack',
    missileAttack: 'Missile Attack',
    colonize: 'Colonize',
    switch: 'Switch',
    recycle: 'Recycle',
    debrisField: 'Debris Field',
    oreDeposits: 'Ore Deposits',
    deposits: 'Deposits',
    scoutPlanetTitle: 'Scout Planet',
    attackPlanetTitle: 'Attack Planet',
    missileAttackTitle: 'Missile Attack',
    colonizePlanetTitle: 'Colonize Planet',
    recyclePlanetTitle: 'Recycle Debris',
    scoutPlanetMessage:
      'Are you sure you want to send espionage probes to scout planet [{coordinates}]?\n\nPlease go to the fleet page to select ships and send.',
    attackPlanetMessage: 'Are you sure you want to attack planet [{coordinates}]?\n\nPlease go to the fleet page to select ships and send.',
    missileAttackMessage: 'Launch interplanetary missiles to attack planet [{coordinates}]',
    missileCount: 'Missile Count',
    availableMissiles: 'Available Missiles',
    missileRange: 'Missile Range',
    systems: 'systems',
    distance: 'Distance',
    flightTime: 'Flight Time',
    outOfRange: 'Out of Range',
    launchMissile: 'Launch',
    missileLaunched: 'Missile Launched',
    cancel: 'Cancel',
    colonizePlanetMessage:
      'Are you sure you want to colonize position [{coordinates}]?\n\nPlease go to the fleet page to send a colony ship.',
    recyclePlanetMessage:
      'Are you sure you want to recycle debris at position [{coordinates}]?\n\nPlease go to the fleet page to send recycler ships.',
    sendGift: 'Send Gift',
    debris: 'Debris',
    giftPlanetTitle: 'Send Gift',
    giftPlanetMessage:
      'Are you sure you want to send resources as a gift to planet [{coordinates}]?\n\nPlease go to the fleet page to select transport ships and load resources.',
    npcPlanetName: "{name}'s Planet",
    // Sensor Phalanx Scan
    phalanxScan: 'Phalanx Scan',
    phalanxScanTitle: 'Sensor Phalanx Scan',
    phalanxScanDescription: 'Scanning fleet activity at planet [{coordinates}]',
    phalanxNoMoon: 'Requires a moon with Sensor Phalanx to scan',
    phalanxCost: 'Scan Cost',
    phalanxNoFleets: 'No fleet activity detected',
    phalanxFleetDetected: '{count} fleet(s) detected',
    phalanxOrigin: 'Origin',
    phalanxDestination: 'Destination',
    phalanxArrival: 'Arrival',
    phalanxReturn: 'Return',
    phalanxStatusOutbound: 'Outbound',
    phalanxStatusReturning: 'Returning',
    phalanxInsufficientDeuterium: 'Insufficient Deuterium',
    intercepted: 'Intercepted',
    defenseLosses: 'Defense Losses'
  },
  messagesView: {
    title: 'Messages',
    battles: 'Battles',
    spy: 'Spy',
    npc: 'NPC',
    diplomacy: 'Diplomacy',
    battleReports: 'Battle Reports',
    spyReports: 'Spy Reports',
    noBattleReports: 'No battle reports',
    noSpyReports: 'No spy reports',
    noDiplomaticReports: 'No diplomatic reports',
    battleReport: 'Battle Report',
    spyReport: 'Spy Report',
    victory: 'Victory',
    defeat: 'Defeat',
    draw: 'Draw',
    attackerFleet: 'Attacker Fleet',
    defenderFleet: 'Defender Fleet',
    defenderDefense: 'Defender Defense',
    attackerLosses: 'Attacker Losses',
    defenderLosses: 'Defender Losses',
    noLosses: 'No losses',
    losses: 'Losses',
    remainingUnits: 'Remaining Units',
    plunder: 'Plunder',
    debrisField: 'Debris Field',
    resources: 'Resources',
    fleet: 'Fleet',
    defense: 'Defense',
    buildings: 'Buildings',
    unread: 'Unread',
    pending: 'Pending',
    invalidData: 'Invalid Data',
    targetPlanet: 'Target Planet',
    attackerRemaining: 'Attacker Remaining',
    defenderRemaining: 'Defender Remaining',
    allDestroyed: 'All destroyed',
    moonChance: 'Moon Chance',
    showRoundDetails: 'Show Round Details',
    hideRoundDetails: 'Hide Round Details',
    round: 'Round {round}',
    attackerRemainingPower: 'Attacker Remaining Power',
    defenderRemainingPower: 'Defender Remaining Power',
    playAnimation: 'Play Animation',
    showDetails: 'Show Details',
    speed: 'Speed',
    power: 'Power',
    battleLogEmpty: 'Battle log is empty',
    roundStarted: 'Round {round} started',
    shipDestroyed: '{count} {ship} destroyed',
    defenseDestroyed: '{count} {defense} destroyed',
    attackerWins: 'Attacker Wins',
    defenderWins: 'Defender Wins',
    roundsPlayed: 'rounds played',
    spied: 'Spied',
    spiedNotification: 'Spied Notification',
    noSpiedNotifications: 'No spied notifications',
    detected: 'Detected',
    undetected: 'Undetected',
    missions: 'Missions',
    noMissionReports: 'No mission reports',
    success: 'Success',
    failed: 'Failed',
    npcActivity: 'NPC Activity',
    noNPCActivity: 'No NPC activity notifications',
    npcRecycleActivity: 'NPC Recycling Debris',
    gifts: 'Gifts',
    giftRejected: 'Rejected',
    noGiftNotifications: 'No gift notifications',
    noGiftRejected: 'No rejected gifts',
    giftFrom: 'Gift from {npcName}',
    giftRejectedBy: '{npcName} rejected the gift',
    giftResources: 'Gift resources',
    rejectedResources: 'Rejected resources',
    expectedReputation: 'Expected reputation',
    currentReputation: 'Current reputation',
    acceptGift: 'Accept',
    rejectGift: 'Reject',
    rejectionReason: {
      hostile: 'They are hostile towards you and do not accept gifts',
      neutral_distrust: 'They lack trust in you',
      polite_decline: 'They politely declined'
    },
    // Spied notification dialog
    spiedNotificationDetails: 'Spied Notification Details',
    spyDetected: 'Spy Detected',
    detectionResult: 'Detection Result',
    detectionSuccess: 'You detected the enemy spy!',
    spiedNotificationMessage: '{npc} attempted to spy on your planet {planet}',
    spiedNotificationTip: 'Consider increasing your defense or counter-attacking if this NPC is hostile',
    viewInGalaxy: 'View in Galaxy',
    // Mission report dialog
    missionReportDetails: 'Mission Report Details',
    missionSuccess: 'Success',
    missionFailed: 'Failed',
    origin: 'Origin',
    destination: 'Destination',
    missionDetails: 'Mission Details',
    transportedResources: 'Transported Resources',
    recycledResources: 'Recycled Resources',
    remainingDebris: 'Remaining Debris',
    newPlanet: 'New Planet',
    // NPC activity dialog
    npcActivityDetails: 'NPC Activity Details',
    activityType: {
      recycle: 'Recycling Debris'
    },
    activityLocation: 'Activity Location',
    position: 'Position',
    nearPlanet: 'Near Planet',
    activityDescription: 'Activity Description',
    npcActivityMessage: '{npc} is {activity} at {position}',
    arrivalTime: 'Arrival Time',
    npcActivityTip: 'NPCs may collect debris from battles. You can try to reach the location first if you want to compete for resources',
    // Clear messages
    clearMessages: 'Clear Messages',
    clearMessageTypes: 'Select message types to clear',
    clearBattleReports: 'Battle Reports',
    clearSpyReports: 'Spy Reports',
    clearSpiedNotifications: 'Spied Notifications',
    clearMissionReports: 'Mission Reports',
    clearNPCActivity: 'NPC Activity',
    clearGiftNotifications: 'Gift Notifications',
    clearGiftRejected: 'Rejected Gifts',
    clearTradeOffers: 'Trade Offers',
    clearIntelReports: 'Intel Reports',
    clearJointAttackInvites: 'Joint Attack Invitations',
    clearNow: 'Clear Now',
    clearSuccess: 'Messages cleared'
  },
  missionReports: {
    transportSuccess: 'Transport mission completed successfully',
    transportFailed: 'Transport mission failed',
    transportFailedTargetNotFound: 'Transport failed: Target planet does not exist',
    transportFailedGiftRejected: 'Transport failed: Gift was rejected',
    colonizeSuccess: 'Colonization mission successful, new planet established',
    colonizeFailed: 'Colonization mission failed',
    colonizeFailedOccupied: 'Colonization failed: Target position is already occupied by another planet',
    colonizeFailedMaxColonies: 'Colonization failed: Maximum number of colonies reached. Research Astrophysics to increase the limit.',
    spySuccess: 'Espionage mission completed successfully',
    spyFailed: 'Espionage mission failed',
    spyFailedTargetNotFound: 'Espionage failed: Target planet does not exist',
    deploySuccess: 'Deployment mission completed successfully',
    deployFailed: 'Deployment mission failed',
    deployFailedTargetNotFound: 'Deployment failed: Target planet does not exist',
    deployFailedNotOwnPlanet: 'Deployment failed: Target planet does not belong to you',
    recycleSuccess: 'Recycling mission completed successfully',
    recycleFailed: 'Recycling mission failed, no debris at target location',
    recycleFailedNoDebris: 'Recycling failed: No debris field at target location',
    recycleFailedDebrisEmpty: 'Recycling failed: Debris field has been cleared',
    destroySuccess: 'Planet destruction mission executed successfully',
    destroyFailed: 'Planet destruction mission failed',
    destroyFailedTargetNotFound: 'Destruction failed: Target planet does not exist',
    destroyFailedOwnPlanet: 'Destruction failed: Cannot destroy your own planet',
    destroyFailedNoDeathstar: 'Destruction failed: No Death Star to execute the mission',
    destroyFailedChance: 'Destruction failed: Probability check failed (Success rate: {chance}%)',
    missileAttackSuccess: 'Missile attack successful',
    missileAttackFailed: 'Missile attack failed, target planet does not exist',
    missileAttackIntercepted: 'All missiles intercepted',
    hits: 'hits',
    expeditionResources: 'The expedition found resources!',
    expeditionDarkMatter: 'The expedition found dark matter!',
    expeditionFleet: 'The expedition found abandoned ships!',
    expeditionPiratesAttack: 'The expedition was attacked by pirates and lost some ships',
    expeditionPiratesEscaped: 'The expedition encountered pirates but escaped successfully',
    expeditionAliensAttack: 'The expedition was attacked by aliens and lost some ships',
    expeditionAliensEscaped: 'The expedition encountered aliens but escaped successfully',
    expeditionNothing: 'The expedition found nothing'
  },
  simulatorView: {
    title: 'Battle Simulator',
    attacker: 'Attacker',
    defender: 'Defender',
    attackerConfig: 'Attacker Configuration',
    attackerConfigDesc: 'Configure attacker fleet and technology levels',
    defenderConfig: 'Defender Configuration',
    defenderConfigDesc: 'Configure defender fleet, defense, and technology levels',
    fleet: 'Fleet',
    defenseStructures: 'Defense Structures',
    techLevels: 'Technology Levels',
    weapon: 'Weapon',
    shield: 'Shield',
    armor: 'Armor',
    defenderResources: 'Defender Resources (for plunder calculation)',
    startSimulation: 'Start Simulation',
    reset: 'Reset',
    battleResult: 'Battle Result',
    attackerVictory: 'Attacker Victory',
    defenderVictory: 'Defender Victory',
    draw: 'Draw',
    afterRounds: 'After {rounds} rounds',
    attackerLosses: 'Attacker Losses',
    defenderLosses: 'Defender Losses',
    noLosses: 'No losses',
    attackerRemaining: 'Attacker Remaining',
    defenderRemaining: 'Defender Remaining',
    allDestroyed: 'All destroyed',
    plunderableResources: 'Plunderable Resources',
    debrisField: 'Debris Field',
    moonChance: 'Moon chance',
    showRoundDetails: 'Show round details',
    hideRoundDetails: 'Hide round details',
    round: 'Round {round}',
    attackerRemainingPower: 'Attacker remaining power',
    defenderRemainingPower: 'Defender remaining power',
    // Battle animation
    playAnimation: 'Play Animation',
    showDetails: 'Show Details',
    speed: 'Speed',
    power: 'Power',
    battleLogEmpty: 'Battle log is empty',
    roundStarted: 'Round {round} started',
    shipDestroyed: '{count} {ship} destroyed',
    defenseDestroyed: '{count} {defense} destroyed',
    attackerWins: 'Attacker Wins',
    defenderWins: 'Defender Wins',
    roundsPlayed: 'rounds played',
    spied: 'Spied',
    spiedNotification: 'Spied Notification',
    noSpiedNotifications: 'No spied notifications',
    detected: 'Detected',
    undetected: 'Undetected'
  },
  settings: {
    dataManagement: 'Data Management',
    dataManagementDesc: 'Export, import, or clear game data',
    exportData: 'Export Data',
    exportDataDesc: 'Export game progress as JSON file',
    export: 'Export',
    exporting: 'Exporting...',
    exportSuccess: 'Export successful',
    exportSuccessWithPath: 'Export successful, file saved to: {path}',
    exportFailed: 'Export failed, please try again',
    importData: 'Import Data',
    importDataDesc: 'Restore game progress from JSON file',
    selectFile: 'Select File',
    importSuccess: 'Import successful',
    importConfirmTitle: 'Confirm Import',
    importConfirmMessage: 'Importing will overwrite current game progress. This action cannot be undone. Continue?',
    importFailed: 'Import failed, please check file format',
    clearData: 'Clear Data',
    clearDataDesc: 'Delete all game data and reset',
    clear: 'Clear',
    clearConfirmTitle: 'Confirm Clear Data',
    clearConfirmMessage: 'This will delete all game data and start over. This action cannot be undone. Continue?',
    gameSettings: 'Game Settings',
    gameSettingsDesc: 'Adjust game parameters and preferences',
    gamePause: 'Game Pause',
    gamePauseDesc: 'Pause or resume game time and resource production',
    pause: 'Pause',
    resume: 'Resume',
    gamePaused: 'Game paused',
    gameResumed: 'Game resumed',
    gameSpeed: 'Resource Production Speed',
    gameSpeedDesc: 'Current resource production speed multiplier',
    speedChanged: 'Resource production speed changed to {speed}x',
    speedReset: 'Resource production speed reset to 1x',
    reset: 'Reset',
    about: 'About',
    version: 'Version',
    checkUpdate: 'Check Update',
    checking: 'Checking...',
    newVersionAvailable: 'New version {version} available',
    upToDate: 'Already up to date',
    checkUpdateFailed: 'Failed to check for updates, please check your network connection',
    viewUpdate: 'View Update',
    updateAvailable: 'A new version is available. Click to view release notes.',
    download: 'Download',
    buildDate: 'Build Date',
    community: 'Community',
    github: 'GitHub Repository',
    qqGroup: 'QQ Group',
    privacyPolicy: 'Privacy Policy',
    displaySettings: 'Display Settings',
    displaySettingsDesc: 'Adjust visual effects',
    backgroundAnimation: 'Background Animation',
    backgroundAnimationDesc: 'Show starfield/particle background animation (may affect performance)',
    notifications: 'Notification Settings',
    notificationsDesc: 'Manage in-game notification alerts',
    notificationTypes: 'Notification Types',
    browserNotifications: 'Browser Notifications',
    inAppNotifications: 'In-App Notifications',
    constructionComplete: 'Construction Complete',
    researchComplete: 'Research Complete',
    unlockNotification: 'Unlock Notification',
    browserPermission: 'Enable Browser Notifications',
    permissionGranted: 'Permission Granted',
    permissionDenied: 'Permission Denied/Not Granted',
    inAppNotificationsDesc: 'Show via in-page popups',
    notificationsDisabled: 'Enable any switch above to configure specific notifications',
    suppressInFocus: 'Suppress browser notifications when page is focused',
    expandTypes: 'Expand Details',
    collapseTypes: 'Collapse Details',
    // NPC name update
    npcNameUpdateTitle: 'Old NPC Names Detected',
    npcNameUpdateMessage: 'Found {count} NPCs using old name format. Would you like to update them to new localized names?',
    npcNameUpdateConfirm: 'Update Names',
    npcNameUpdateCancel: 'Keep Current',
    npcNameUpdateSuccess: 'Successfully updated {count} NPC names',
    npcNameUpdateSkipped: 'NPC name update skipped',
    // WebDAV
    webdav: {
      title: 'Cloud Sync',
      desc: 'Sync game saves via WebDAV',
      config: 'Configure',
      configTitle: 'WebDAV Configuration',
      configDesc: 'Configure your WebDAV server for cloud sync',
      notConfigured: 'Please configure WebDAV server first',
      serverUrl: 'Server URL',
      serverUrlPlaceholder: 'e.g. https://dav.example.com',
      serverUrlHint: 'Enter your WebDAV server address',
      username: 'Username',
      usernamePlaceholder: 'Enter username',
      password: 'Password',
      passwordPlaceholder: 'Enter password',
      passwordHint: 'Password is stored locally only',
      basePath: 'Save Path',
      basePathPlaceholder: 'e.g. /ogame-saves/',
      testConnection: 'Test Connection',
      testing: 'Testing...',
      testSuccess: 'Connection successful',
      testFailed: 'Connection failed',
      save: 'Save',
      clearConfig: 'Clear',
      configSaved: 'Configuration saved',
      configCleared: 'Configuration cleared',
      upload: 'Upload',
      uploading: 'Uploading...',
      uploadSuccess: 'Upload successful',
      uploadFailed: 'Upload failed',
      download: 'Download',
      downloadSuccess: 'Download successful',
      downloadFailed: 'Download failed',
      selectFile: 'Select Save File',
      selectFileDesc: 'Choose a save file to restore',
      noFiles: 'No save files found',
      loadFailed: 'Failed to load file list',
      confirmDelete: 'Are you sure you want to delete "{name}"?',
      deleteSuccess: 'File deleted',
      deleteFailed: 'Delete failed'
    }
  },
  notifications: {
    constructionComplete: 'Construction Complete',
    researchComplete: 'Research Complete',
    newUnlock: 'New Content Unlocked',
    building: 'Building',
    technology: 'Technology'
  },
  gmView: {
    title: 'GM Control Panel',
    adminOnly: 'Admin Only',
    selectPlanet: 'Select Planet',
    choosePlanet: 'Choose a planet',
    resources: 'Resources',
    buildings: 'Buildings',
    research: 'Research',
    ships: 'Ships',
    defense: 'Defense',
    officers: 'Officers',
    modifyResources: 'Modify Resources',
    resourcesDesc: 'Quickly modify planet resources',
    maxAllResources: 'Max All',
    maxAllResourcesSuccess: 'All resources maxed out',
    modifyBuildings: 'Modify Buildings',
    buildingsDesc: 'Quickly set building levels',
    modifyResearch: 'Modify Research',
    researchDesc: 'Quickly set research levels',
    modifyShips: 'Modify Ships',
    shipsDesc: 'Quickly set ship counts',
    modifyDefense: 'Modify Defense',
    defenseDesc: 'Quickly set defense counts',
    modifyOfficers: 'Modify Officers',
    officersDesc: 'Quickly set officer expiration time',
    days: 'd',
    npcTesting: 'NPC Testing',
    npcTestingDesc: 'Test NPC spy and attack behavior',
    selectNPC: 'Select NPC',
    chooseNPC: 'Choose an NPC',
    targetPlanet: 'Target Planet',
    chooseTarget: 'Choose target planet',
    testSpy: 'Test Spy',
    testAttack: 'Test Attack',
    testSpyAndAttack: 'Test Spy & Attack',
    testSpyMessage: 'Click confirm to accelerate the spy mission',
    testAttackMessage: 'Click confirm to accelerate the attack mission',
    testSpyAndAttackMessage: 'Click confirm to accelerate the missions',
    initializeFleet: 'Initialize NPC Fleet',
    accelerateMissions: 'Accelerate All Missions (5s)',
    selectNPCFirst: 'Please select an NPC first',
    npcNoProbes: 'NPC has no spy probes',
    npcNoSpyReport: 'NPC needs to spy first',
    npcMissionFailed: 'Failed to create mission',
    npcNoPlanets: 'NPC has no planets',
    npcWillSpyIn5s: '{npcName} will spy in 5 seconds',
    npcWillAttackIn5s: '{npcName} will attack in 5 seconds',
    npcWillSpyAndAttack: '{npcName} will spy in 5s and attack in 10s',
    acceleratedMissions: 'Accelerated {count} missions to 5 seconds',
    npcFleetInitialized: '{npcName} fleet initialized',
    npcFleetDetails:
      '100 Spy Probes\n500 Light Fighters\n300 Heavy Fighters\n200 Cruisers\n100 Battleships\n50 Bombers\n30 Destroyers\n20 Battlecruisers',
    dangerZone: 'Danger Zone',
    dangerZoneDesc: 'The following operations are irreversible',
    resetGame: 'Reset Game',
    resetGameConfirm: 'Are you sure you want to reset the game? This will delete all data!',
    completeAllQueues: 'Complete All Queues',
    completeAllQueuesDesc: 'Instantly complete all building, research, ship, defense queues and fleet missions',
    completeQueues: 'Complete Queues',
    completeQueuesSuccess:
      'Completed {buildingCount} building queues, {researchCount} research queues, {missionCount} fleet missions, {missileCount} missile attacks'
  },
  alerts: {
    incomingFleets: '{count} Incoming Enemy Fleets',
    npcSpyIncoming: 'NPC Spy Probe Incoming',
    npcAttackIncoming: 'NPC Fleet Attack Incoming!',
    npcFleetIncoming: 'NPC Fleet Approaching',
    ships: 'ships',
    spiedBy: 'Spied By',
    attackedBy: 'Attacked By',
    detectionSuccess: 'Spy detected',
    detectionFailed: 'Spy not detected',
    npcSpiedYourPlanet: 'NPC spied your planet',
    npcAttackedYourPlanet: 'NPC attacked your planet'
  },
  enemyAlert: {
    title: 'Enemy Alert',
    markAllRead: 'Mark All Read',
    noAlerts: 'No alerts',
    fleetSize: 'Fleet Size',
    ships: 'ships',
    viewFleet: 'View Fleet',
    alertDetails: 'Alert Details',
    targetInfo: 'Target Info',
    arrivalTime: 'Arrival Time',
    countdown: 'Countdown',
    viewMessages: 'View Messages',
    arrived: 'Arrived',
    missionType: {
      spy: 'Spy',
      attack: 'Attack',
      recycle: 'Recycle',
      unknown: 'Unknown'
    },
    warning: {
      spy: 'Enemy spy incoming!',
      attack: 'Enemy attack incoming!',
      recycle: 'Enemy is recycling debris near you!',
      unknown: 'Enemy fleet incoming!'
    }
  },
  diplomacy: {
    title: 'Diplomacy',
    description: 'Manage diplomatic relations with NPCs',
    tabs: {
      all: 'All',
      friendly: 'Friendly',
      neutral: 'Neutral',
      hostile: 'Hostile'
    },
    noNpcs: 'No NPCs',
    noFriendlyNpcs: 'No friendly NPCs',
    noNeutralNpcs: 'No neutral NPCs',
    noHostileNpcs: 'No hostile NPCs',
    ago: 'ago',
    notifications: 'Diplomatic Notifications',
    markAllRead: 'Mark All Read',
    noReports: 'No diplomatic events',
    viewAll: 'View All',
    status: {
      friendly: 'Friendly',
      neutral: 'Neutral',
      hostile: 'Hostile'
    },
    planets: 'planets',
    allies: 'allies',
    reputation: 'Reputation',
    alliedWith: 'Allied with',
    more: 'more',
    actions: {
      gift: 'Send Gift',
      viewPlanets: 'View Planets',
      addNote: 'Add Note',
      editNote: 'Edit Note'
    },
    note: 'Note',
    notePlaceholder: 'Enter note...',
    lastEvent: 'Last Event',
    reportDetails: 'Diplomatic Report Details',
    eventDescription: 'Event Description',
    reputationChange: 'Reputation Change',
    before: 'Before',
    after: 'After',
    statusChange: 'Status Change',
    viewDiplomacy: 'View Diplomacy Page',
    eventType: {
      gift: 'Sent resources',
      attack: 'Launched an attack',
      allyAttacked: 'Attacked an ally',
      spy: 'Conducted espionage',
      stealDebris: 'Stole debris',
      destroyPlanet: 'Destroyed a planet',
      unknown: 'Unknown event'
    },
    events: {
      gift: 'Sent Gift',
      attack: 'Attack',
      missileAttack: 'Missile Attack',
      allyAttacked: 'Ally Attacked',
      spy: 'Espionage',
      stealDebris: 'Debris Stolen'
    },
    reports: {
      giftedResources: 'Gifted {metal}M {crystal}C {deuterium}D',
      receivedGiftFromPlayer: 'Received gift from player',
      giftedToNpc: 'You gifted resources to {npcName}. Reputation +{reputation}',
      rejectedPlayerGift: "Rejected player's gift",
      npcRejectedGift: '{npcName} rejected your gift. Reputation {reputation}',
      attackedNpc: 'Attacked {npcName}',
      wasAttackedByPlayer: 'Was attacked by player',
      youAttackedNpc: 'You attacked {npcName}',
      playerAttackedAlly: 'Player attacked ally {allyName}',
      allyDispleased: '{allyName} is displeased that you attacked their ally {targetName}',
      wasSpiedByPlayer: 'Was spied by player (detected: {detected})',
      spyDetected: 'Your espionage was detected by {npcName}',
      stoleDebrisFromTerritory: "Stole debris from {npcName}'s territory",
      playerStoleDebris: 'Player stole debris from territory',
      recycledDebrisNearNpc: "You recycled debris near {npcName}'s planet. They are displeased.",
      giftedResourcesToPlayer: 'Gifted resources to player',
      receivedGiftFromNpc: 'Received gift from {npcName}',
      acceptedGiftFromNpc: 'You accepted a gift from {npcName}: {metal}M {crystal}C {deuterium}D',
      playerRejectedGift: 'Player rejected gift',
      rejectedGiftFromNpc: 'You rejected a gift from {npcName}. Reputation {reputation}',
      destroyedNpcPlanet: "Destroyed {npcName}'s {planetName}",
      playerDestroyedPlanet: 'Player destroyed {planetName}',
      youDestroyedNpcPlanet: "You destroyed {npcName}'s {planetName}. Reputation {reputation}",
      playerDestroyedAllyPlanet: "Player destroyed ally {allyName}'s {planetName}",
      allyOutraged: "{allyName} is outraged that you destroyed their ally {targetName}'s {planetName}",
      npcEliminated: 'NPC {npcName} has been completely eliminated',
      npcEliminatedMessage: "You destroyed all of {npcName}'s planets! This faction has been completely wiped out."
    },
    searchPlaceholder: 'Search NPC name...',
    // Notification types
    notificationType: {
      tradeOffer: 'Trade Offer',
      intelReport: 'Intel Report',
      jointAttack: 'Joint Attack Invitation'
    },
    // Notification badges
    notificationBadge: {
      trade: 'Trade',
      intel: 'Intel',
      jointAttack: 'Invite'
    },
    // Notification extra info
    notificationExtra: {
      pending: 'Pending'
    },
    viewMode: {
      card: 'Card',
      list: 'List'
    },
    diagnostic: {
      button: 'NPC Diagnostic',
      title: 'NPC Status Diagnostic',
      description:
        'Player points: {points}, Spy interval: {spyInterval}min, Attack interval: {attackInterval}min, Attack probability: {attackProb}%',
      noData: 'No NPC data',
      difficulty: 'Difficulty',
      difficultyLevels: {
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard'
      },
      aiType: 'AI Type',
      aiTypes: {
        aggressive: 'Aggressive',
        defensive: 'Defensive',
        trader: 'Trader',
        expansionist: 'Expansionist',
        balanced: 'Balanced'
      },
      aiTypeDescriptions: {
        aggressive: 'Actively scouts and attacks, retaliates fiercely',
        defensive: 'Rarely attacks first, retaliates strongly when attacked',
        trader: 'Rarely attacks, prefers trading and gifting',
        expansionist: 'Focuses on development, attacks less',
        balanced: 'Dynamically adjusts strategy based on situation'
      },
      reputation: 'Reputation',
      spyProbes: 'Spy Probes',
      fleetPower: 'Fleet Power',
      canSpy: 'Can Spy',
      canAttack: 'Can Attack',
      attackProbability: 'Attack Probability',
      nextSpy: 'Next Spy',
      nextAttack: 'Next Attack',
      yes: 'Yes',
      no: 'No',
      timeFormat: '{min}m {sec}s',
      anytime: 'Anytime',
      statusExplanation: 'Status Explanation',
      noRelation: 'No Relation',
      noRelationNeutral: 'No Relation (Neutral)',
      reasons: {
        friendlyNoAction: 'Friendly relationship, will not act',
        neutralNoAction: 'Neutral relationship, will not act',
        hostileWillAct: 'Hostile relationship, may take action',
        noRelationNeutral: 'No diplomatic relation, treated as neutral',
        insufficientProbes: 'Insufficient probes (Current: {current}, Required: {required})',
        noFleet: 'No combat fleet',
        spyCooldown: 'Spy on cooldown ({min}m {sec}s)',
        attackCooldown: 'Attack on cooldown ({min}m {sec}s)',
        notSpiedYet: 'Not yet spied, need to spy first'
      }
    },
    aiType: 'AI Type',
    aiTypes: {
      aggressive: 'Aggressive',
      defensive: 'Defensive',
      trader: 'Trader',
      expansionist: 'Expansionist',
      balanced: 'Balanced'
    },
    aiTypeDescriptions: {
      aggressive: 'Actively spies and attacks, strong retaliation',
      defensive: 'Rarely attacks, strong retaliation when attacked',
      trader: 'Almost never attacks, prefers trading and gifts',
      expansionist: 'Focuses on development, less aggressive',
      balanced: 'Dynamically adjusts strategy based on situation'
    }
  },
  pagination: {
    previous: 'Previous',
    next: 'Next',
    first: 'First',
    last: 'Last',
    page: 'Page {page}'
  },
  notFound: {
    title: 'Page Not Found',
    description: 'Sorry, the page you are looking for does not exist',
    goHome: 'Go Home'
  },
  privacy: {
    title: 'Privacy Policy',
    sections: {
      introduction: {
        title: 'Introduction',
        content:
          'This privacy policy explains how OGame-Vue-Ts handles your data. We are committed to protecting your privacy, and this game is designed with complete respect for user privacy.'
      },
      dataCollection: {
        title: 'Data Collection',
        content: 'This game only collects and stores the following data locally in your browser:',
        items: {
          gameProgress: 'Game progress (building levels, fleets, resources, etc.)',
          settings: 'Game settings (notification preferences, display options, etc.)',
          language: 'Language preference'
        }
      },
      dataStorage: {
        title: 'Data Storage',
        content:
          "All data is stored in your browser's local storage (localStorage). This means your data always remains on your own device, and we cannot access, view, or collect any of your game data."
      },
      noServer: {
        title: 'No Server Communication',
        content:
          'This game is a completely offline single-player game. Except for the update check feature (which fetches version information from GitHub), the game does not communicate with any server. Your game data never leaves your device.'
      },
      thirdParty: {
        title: 'Third-Party Services',
        content:
          'This game uses third-party analytics services to track visitor statistics and traffic sources, helping us understand usage patterns and improve the gaming experience. This analytics data is anonymous and does not contain any personally identifiable information. We do not use any advertising services or other commercial tracking tools.'
      },
      dataControl: {
        title: 'Data Control',
        content: 'You have complete control over your data:',
        items: {
          export: 'You can export your game data at any time',
          import: 'You can import data from backup files',
          delete: 'You can delete all data by clearing browser data or using the in-game "Clear Data" feature'
        }
      },
      contact: {
        title: 'Contact Us',
        content: 'If you have any questions about this privacy policy, please contact us via:'
      }
    }
  },
  time: {
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds'
  },
  tutorial: {
    progress: 'Progress',
    previous: 'Previous',
    next: 'Next',
    gotIt: 'Got It',
    completeButton: 'Complete',
    skip: 'Skip Tutorial',
    welcome: {
      title: 'Welcome to OGame',
      content:
        'Welcome, Commander! This tutorial will guide you through the basics of building your empire. Click "Next" to begin your journey.'
    },
    resources: {
      title: 'Resource Overview',
      content:
        'These are your resources: Metal, Crystal, and Deuterium. They are essential for building structures and researching technologies. Energy is also important to power your infrastructure.'
    },
    planet: {
      title: 'Your Planet',
      content: 'This is your home planet. You can view its name, coordinates, and switch between planets here as you expand your empire.'
    },
    navigation: {
      title: 'Navigation Menu',
      content:
        'Use this menu to navigate between different sections: Buildings, Research, Fleet, Galaxy, and more. Each section offers unique gameplay features.'
    },
    gotoBuildings: {
      title: 'Go to Buildings',
      content: 'Let\'s start by building some structures. Click on the "Buildings" menu item to view available structures.'
    },
    buildSolarPlant: {
      title: 'Build Solar Plant',
      content:
        'First, build a Solar Plant! It generates energy for your planet. Without energy, other resource buildings cannot function. This is the most important first step.'
    },
    waitBuild: {
      title: 'Build Queue',
      content:
        'Your building is now in the construction queue. Click the queue icon in the top-right corner to view all ongoing construction and research tasks. Buildings take time to complete, but you can continue working while waiting.'
    },
    buildMetalMine: {
      title: 'Build Metal Mine',
      content:
        "Now that you have energy, you can build the Metal Mine. It's your primary source of metal, which is used in almost every structure and ship."
    },
    buildCrystalMine: {
      title: 'Build Crystal Mine',
      content: 'Crystal is rarer but essential for advanced technologies. Build a Crystal Mine to start collecting this valuable resource.'
    },
    buildDeuterium: {
      title: 'Build Deuterium Synthesizer',
      content:
        'Deuterium is essential for ship fuel and advanced research. Build a Deuterium Synthesizer to start producing this critical resource.'
    },
    upgradeMines: {
      title: 'Upgrade Resource Mines',
      content:
        'Next, you need to upgrade all three resource mines (Metal, Crystal, Deuterium) to level 2 to meet the requirements for building a Robotics Factory. Upgrade them when you have enough resources.'
    },
    buildRobotics: {
      title: 'Build Robotics Factory',
      content:
        'The Robotics Factory significantly speeds up construction. It requires Metal Mine, Crystal Mine, and Deuterium Synthesizer at level 2 each. Build it to improve construction efficiency!'
    },
    upgradeMinesForLab: {
      title: 'Continue Upgrading Mines',
      content:
        'Now you need to upgrade all three resource mines to level 3 to meet the requirements for the Research Lab. Keep developing your resource production.'
    },
    buildResearchLab: {
      title: 'Build Research Lab',
      content:
        'The Research Lab is the foundation of technological advancement. It requires all three resource mines at level 3. Build it to unlock technology research!'
    },
    gotoResearch: {
      title: 'Go to Research',
      content: 'Now that you have a Research Lab, click on the "Research" menu to view available technologies.'
    },
    researchEnergy: {
      title: 'Research Energy Technology',
      content:
        "Energy Technology improves your energy production and unlocks advanced structures. It's one of the most fundamental and important technologies."
    },
    shipyardIntro: {
      title: 'Fleet and Shipyard',
      content:
        'Ships allow you to explore the galaxy, transport resources, and defend your empire. To build ships, you need a Shipyard (requires Robotics Factory level 2).'
    },
    gotoBuildingsForShipyard: {
      title: 'Return to Buildings',
      content: 'Go back to the Buildings page to construct your Shipyard.'
    },
    buildShipyard: {
      title: 'Build Shipyard',
      content: 'The Shipyard allows you to construct ships and defense systems. This is crucial for fleet operations.'
    },
    fleetIntro: {
      title: 'Fleet Operations',
      content:
        'Once you have ships, you can send them on missions: transport resources, colonize planets, attack enemies, or explore debris fields.'
    },
    galaxyIntro: {
      title: 'Explore the Galaxy',
      content:
        'The Galaxy view shows other planets, debris fields, and opportunities for expansion. Use it to scout targets and plan your strategy.'
    },
    complete: {
      title: 'Tutorial Complete!',
      content:
        'Congratulations, Commander! You now know the basics. Continue building your empire, research technologies, and explore the galaxy. Remember: develop energy first, then resources, then factories and research! Good luck!'
    },
    // Mobile tutorial
    mobile: {
      welcome: {
        title: 'Welcome to OGame (Mobile)',
        content:
          "Welcome, Commander! This is a streamlined tutorial designed for touchscreens. We'll quickly cover the core features to get you started building your empire."
      },
      resources: {
        title: 'Top Resource Bar',
        content: 'At the top, you see your resources: Metal, Crystal, and Deuterium. Tap to view detailed production info.'
      },
      menu: {
        title: 'Open Navigation Menu',
        content:
          'Tap this menu icon to open the navigation bar. You can access Buildings, Research, Fleet, and all other features from here.'
      },
      gotoBuildings: {
        title: 'Go to Buildings Page',
        content: 'The menu is now open! Now tap "Buildings" to start constructing your infrastructure.'
      },
      buildSolarPlant: {
        title: 'Build Solar Plant',
        content: 'First, build a Solar Plant! Scroll down to find it and tap the card to build. Energy is the foundation of everything.'
      },
      waitBuild: {
        title: 'Build Queue',
        content:
          'Click the queue icon in the top-right corner to view build progress. You can continue browsing other pages - construction happens in the background.'
      },
      buildMetalMine: {
        title: 'Build Metal Mine',
        content: 'Now that you have energy, build a Metal Mine. Scroll down to find it and tap to build.'
      },
      complete: {
        title: 'Quick Tutorial Complete!',
        content:
          "Great! You've mastered the basics. Continue building Crystal and Deuterium facilities, then explore other features. Remember: energy first, then resources!"
      }
    }
  },
  hints: {
    close: 'Close',
    gotIt: 'Got it',
    dontShowAgain: "Don't show again",
    resetHints: 'Reset Hints',
    resetHintsDesc: 'Show all hints again',
    hintsEnabled: 'Enable Hints',
    hintsEnabledDesc: 'Show helpful hints when visiting pages',
    overview: {
      title: 'Planet Overview',
      message: 'Here you can see your planet resources, fleet status, and production details. Check back often to monitor your progress!'
    },
    buildings: {
      title: 'Buildings',
      message:
        'Build and upgrade structures here. Start with Solar Plant for energy, then resource mines. Tip: Robotics Factory speeds up construction!'
    },
    research: {
      title: 'Research Lab',
      message:
        'Research technologies to unlock new ships, improve combat, and advance your civilization. Energy Technology is a great start!'
    },
    shipyard: {
      title: 'Shipyard',
      message: 'Build ships to explore, transport resources, and defend your empire. Cargo ships help move resources between planets.'
    },
    fleet: {
      title: 'Fleet Command',
      message: 'Send your ships on missions: attack enemies, transport resources, colonize new planets, or explore debris fields.'
    },
    galaxy: {
      title: 'Galaxy Map',
      message:
        'Explore the galaxy to find empty planets to colonize, debris fields to harvest, and enemies to attack. Use spy probes first!'
    },
    diplomacy: {
      title: 'Diplomacy',
      message:
        'Manage relations with NPCs. Send gifts to improve reputation, or face hostile attacks. Allies of your enemies may turn hostile too!'
    },
    messages: {
      title: 'Messages',
      message: 'View battle reports, spy reports, and diplomatic notifications here. Keep track of your activities and enemy encounters.'
    },
    defense: {
      title: 'Planetary Defense',
      message: 'Build defense structures to protect your planet from attacks. Shield domes and turrets can deter raiders!'
    },
    officers: {
      title: 'Officers',
      message:
        'Recruit officers to gain various bonuses! Commander speeds up construction, Geologist boosts resource production, Admiral enhances fleet capabilities.'
    },
    simulator: {
      title: 'Battle Simulator',
      message: 'Simulate battle outcomes before attacking. Enter both fleets and tech levels to predict victory, losses, and loot.'
    },
    campaign: {
      title: 'Campaign Mode',
      message:
        'Explore the galaxy story campaign! Complete missions to earn resource rewards and unlock new challenges. Each node has unique objectives and enemies.'
    },
    achievements: {
      title: 'Achievement System',
      message:
        'Complete game objectives to unlock achievements and earn Dark Matter rewards! Achievements have multiple tiers - aim for higher challenges to get better rewards.'
    },
    ranking: {
      title: 'Ranking',
      message:
        'Compare your progress with other players and NPCs. See rankings based on points from buildings, research, fleet and defense. Strive to climb the leaderboard!'
    },
    settings: {
      title: 'Settings',
      message: 'Manage game data, adjust notifications, export/import saves here. Remember to backup your progress regularly!'
    },
    gm: {
      title: 'GM Panel',
      message:
        'GM mode allows quick modification of resources, buildings, and tech levels. Use it for testing or experiencing full game content.'
    }
  },
  achievements: {
    title: 'Achievements',
    unlocked: 'Achievement Unlocked',
    progress: 'Progress',
    nextTier: 'Next Tier',
    maxTierReached: 'Max Tier Reached',
    tiers: {
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum',
      diamond: 'Diamond'
    },
    categories: {
      resource: 'Resource',
      building: 'Building',
      combat: 'Combat',
      mission: 'Mission',
      diplomacy: 'Diplomacy'
    },
    names: {
      metalCollector: 'Metal Collector',
      crystalCollector: 'Crystal Collector',
      deuteriumCollector: 'Deuterium Collector',
      darkMatterCollector: 'Dark Matter Collector',
      resourceConsumer: 'Resource Consumer',
      masterBuilder: 'Master Builder',
      researcher: 'Researcher',
      shipwright: 'Shipwright',
      fortifier: 'Fortifier',
      warmonger: 'Warmonger',
      conqueror: 'Conqueror',
      defender: 'Defender',
      fleetDestroyer: 'Fleet Destroyer',
      debrisCreator: 'Debris Creator',
      fleetSacrifice: 'Fleet Sacrifice',
      defenseSacrifice: 'Defense Sacrifice',
      pilot: 'Pilot',
      transporter: 'Transporter',
      cargoMaster: 'Cargo Master',
      colonizer: 'Colonizer',
      spy: 'Spy Master',
      deployer: 'Deployer',
      explorer: 'Explorer',
      luckyExplorer: 'Lucky Explorer',
      recycler: 'Recycler',
      scavenger: 'Scavenger',
      destroyer: 'Destroyer',
      fuelBurner: 'Fuel Burner',
      diplomat: 'Diplomat',
      nemesis: 'Nemesis',
      generous: 'Generous',
      philanthropist: 'Philanthropist',
      target: 'Target',
      watched: 'Watched',
      robbed: 'Robbed',
      lostToNPC: 'Lost to NPC'
    },
    descriptions: {
      metalCollector: 'Total metal produced',
      crystalCollector: 'Total crystal produced',
      deuteriumCollector: 'Total deuterium produced',
      darkMatterCollector: 'Total dark matter produced',
      resourceConsumer: 'Total resources consumed',
      masterBuilder: 'Total buildings upgraded',
      researcher: 'Total researches completed',
      shipwright: 'Total ships produced',
      fortifier: 'Total defenses built',
      warmonger: 'Total attacks launched',
      conqueror: 'Total attacks won',
      defender: 'Total defenses successful',
      fleetDestroyer: 'Enemy fleet destroyed in defense',
      debrisCreator: 'Total debris created from battles',
      fleetSacrifice: 'Total fleet lost',
      defenseSacrifice: 'Total defenses lost in defense',
      pilot: 'Total flight missions',
      transporter: 'Total transport missions',
      cargoMaster: 'Total resources transported',
      colonizer: 'Planets colonized',
      spy: 'Spy missions completed',
      deployer: 'Deploy missions completed',
      explorer: 'Total expeditions',
      luckyExplorer: 'Successful expeditions',
      recycler: 'Total recycling missions',
      scavenger: 'Total resources recycled',
      destroyer: 'Planets destroyed',
      fuelBurner: 'Total fuel consumed',
      diplomat: 'Number of friendly NPCs',
      nemesis: 'Number of hostile NPCs',
      generous: 'Total gifts sent',
      philanthropist: 'Total resources gifted',
      target: 'Times attacked by NPC',
      watched: 'Times spied by NPC',
      robbed: 'Times debris recycled by NPC',
      lostToNPC: 'Total debris resources lost to NPC'
    }
  },
  ranking: {
    title: 'Ranking',
    totalPlayers: '{count} Players',
    yourRanking: 'Your Ranking',
    categories: {
      total: 'Total',
      building: 'Building',
      research: 'Research',
      fleet: 'Fleet',
      defense: 'Defense'
    },
    points: 'pts',
    name: 'Name',
    planets: 'Planets',
    details: 'Details',
    you: 'You',
    scoreBreakdown: 'Score Breakdown',
    noData: 'No ranking data'
  },
  campaign: {
    name: 'Campaign',
    description: 'Explore the mysterious galaxy and uncover ancient secrets',
    totalProgress: 'Total Progress',
    questsCompleted: 'Quests Completed',
    chapter: 'Chapter',
    branch: 'Branch',
    startQuest: 'Start Quest',
    claimRewards: 'Claim Rewards',
    objectives: 'Objectives',
    rewards: 'Rewards',
    completed: 'Completed',
    inProgress: 'In Progress',
    available: 'Available',
    locked: 'Locked',
    notifications: {
      questStarted: 'Quest started',
      questCompleted: 'Quest completed!',
      rewardsClaimed: 'Rewards claimed',
      objectiveCompleted: 'Objective completed',
      chapterUnlocked: 'New chapter unlocked',
      reputationUp: 'Reputation with {npcName} increased by {value}',
      reputationDown: 'Reputation with {npcName} decreased by {value}',
      branchUnlocked: 'New story branch unlocked!'
    },
    dialogue: {
      skip: 'Skip',
      continue: 'Continue',
      finish: 'Finish',
      player: 'Commander',
      npc: 'NPC',
      narrator: 'Narrator',
      mysterious: 'Mysterious Signal',
      unknownSource: 'Unknown source',
      choiceEffect: 'Dialogue choice effect'
    },
    chapters: {
      '1': {
        title: 'Origin',
        description: 'Build your home and take the first step into space',
        backgroundStory:
          'You are a young space commander who has just acquired your first planet. In this vast universe, you will build your home, develop technology, and explore the depths of the galaxy...'
      },
      '2': {
        title: 'Exploration',
        description: 'Explore the universe and discover ancient ruins',
        backgroundStory:
          'As your power grows, mysterious signals from deep space catch your attention. These signals seem to point to an ancient secret, waiting for brave explorers to uncover...'
      },
      '3': {
        title: 'Diplomacy',
        description: 'Establish connections with other factions',
        backgroundStory:
          'You are not alone in the galaxy. Other civilizations are rising. You must decide whether to be their enemy or ally. Diplomatic wisdom will determine how far your empire can go...'
      },
      '4': {
        title: 'Shadow Rising',
        description: 'Face powerful enemies and defend your territory',
        backgroundStory:
          'Danger lurks in the shadows. A powerful hostile force has targeted your territory. War is inevitable. You must prepare to face the coming storm...'
      },
      '5': {
        title: 'Ancient Secrets',
        description: 'Uncover the deepest secrets of the galaxy',
        backgroundStory:
          'All clues point to the most mysterious region of the galaxy. There, the ultimate secrets left by ancient civilizations await. Are you ready to uncover everything?'
      }
    },
    quests: {
      '1_1': {
        title: 'Home Building',
        description: 'Build infrastructure to lay the foundation for your planet'
      },
      '1_2': {
        title: 'Tech Enlightenment',
        description: 'Research basic technology to begin your tech journey'
      },
      '1_3': {
        title: 'First Ship',
        description: 'Build your first warship'
      },
      '1_4': {
        title: 'Strange Neighbors',
        description: 'Scout other factions in nearby systems'
      },
      '1_5': {
        title: 'First Contact',
        description: 'Establish initial contact with nearby NPC factions'
      },
      '2_1': {
        title: 'Pioneer Colony',
        description: 'Colonize your first new planet'
      },
      '2_2': {
        title: 'Deep Space Expedition',
        description: 'Send fleet on expedition missions'
      },
      '2_3': {
        title: 'Mysterious Signal',
        description: 'Investigate mysterious signals from deep space'
      },
      '2_4': {
        title: 'Ruin Investigation',
        description: 'Explore discovered ancient ruins'
      },
      '2_5': {
        title: 'Decrypt Archives',
        description: 'Research data obtained from ruins'
      },
      '3_1': {
        title: 'Peacemaker',
        description: 'Improve relations with NPCs through diplomacy'
      },
      '3_2': {
        title: 'Trade Relations',
        description: 'Establish stable relations with friendly factions'
      },
      '3_3': {
        title: 'Common Threat',
        description: 'Discover potential hostile forces'
      },
      '3_4': {
        title: 'Alliance Negotiations',
        description: 'Form a formal alliance with friendly NPCs'
      },
      '3_5': {
        title: 'Storm Preparation',
        description: 'Build defenses to prepare for challenges'
      },
      '4_1': {
        title: 'Outpost Attack',
        description: 'Repel the first attack from hostile forces'
      },
      '4_2': {
        title: 'Intelligence Gathering',
        description: 'Scout enemy military deployments'
      },
      '4_3': {
        title: 'Counterattack',
        description: 'Launch a counterattack against the enemy'
      },
      '4_4': {
        title: 'Resource Contest',
        description: 'Recycle battlefield debris for resources'
      },
      '4_5': {
        title: 'Eve of Battle',
        description: 'Build a powerful fleet for the final battle'
      },
      '5_1': {
        title: 'Depths of Ruins',
        description: 'Explore the deepest parts of the ruins'
      },
      '5_2': {
        title: 'Ancient Technology',
        description: 'Unlock ancient civilization technology'
      },
      '5_3': {
        title: 'Final Confrontation',
        description: 'Face the final battle against the mysterious enemy'
      },
      '5_4': {
        title: 'New Era',
        description: 'Establish new colonies and begin a new age'
      },
      '5_5': {
        title: 'Legacy Continues',
        description: 'Continue to develop and conquer more systems'
      }
    },
    objectiveTypes: {
      buildBuilding: 'Build {building} to level {level}',
      researchTech: 'Research {tech} to level {level}',
      produceShips: 'Produce {count} {ship}',
      accumulateResources: 'Accumulate {amount} {resource}',
      defeatNPC: 'Defeat {npc}',
      winBattles: 'Win {count} battles',
      recycleDebris: 'Recycle {amount} debris',
      reachRelation: 'Reach {level} relation with {npc}',
      sendGift: 'Send {count} gifts to {npc}',
      formAlliance: 'Form alliance with {npc}',
      colonize: 'Colonize {count} planets',
      expedition: 'Complete {count} expeditions',
      spyTarget: 'Spy on {target}'
    },
    errors: {
      questNotFound: 'Quest not found',
      questNotAvailable: 'Quest not available',
      questNotActive: 'Quest not active',
      questNotCompleted: 'Quest not completed',
      rewardsAlreadyClaimed: 'Rewards already claimed',
      prerequisiteNotMet: 'Prerequisite quest not completed'
    },
    speakers: {
      ancientVoice: 'Ancient Voice',
      neighborNPC: 'Neighbor Faction',
      mysteriousSignal: 'Mysterious Signal',
      enemyCommander: 'Enemy Commander'
    },
    objectiveDescriptions: {
      buildMetalMine: 'Build Metal Mine to level 2',
      buildCrystalMine: 'Build Crystal Mine to level 2',
      buildSolarPlant: 'Build Solar Plant to level 2',
      buildResearchLab: 'Build Research Lab to level 1',
      researchEnergy: 'Research Energy Technology to level 1',
      buildShipyard: 'Build Shipyard to level 2',
      researchCombustion: 'Research Combustion Drive to level 1',
      buildLightFighters: 'Build 5 Light Fighters',
      researchEspionage: 'Research Espionage Technology to level 2',
      buildSpyProbes: 'Build 3 Espionage Probes',
      spyAnyNPC: 'Spy on any NPC planet',
      sendGiftToNPC: 'Send a gift to any NPC',
      researchAstrophysics: 'Research Astrophysics to level 1',
      buildColonyShip: 'Build a Colony Ship',
      colonizeNewPlanet: 'Colonize a new planet',
      completeExpedition: 'Complete an expedition mission',
      discoverRuins: 'Discover ancient ruins',
      researchComputer: 'Research Computer Technology to level 4',
      improveRelation: 'Improve relations with an NPC',
      reachFriendly: 'Reach friendly status with an NPC',
      spyHostileNPC: 'Spy on a hostile NPC',
      formAlliance: 'Form alliance with a friendly NPC',
      buildDefenses: 'Build defense facilities',
      winDefenseBattle: 'Win a defensive battle',
      spyEnemyPlanet: 'Spy on enemy planet',
      attackEnemy: 'Attack the enemy',
      recycleDebris: 'Recycle debris',
      buildBattleships: 'Build 10 Battleships',
      exploreDeepRuins: 'Explore deep ruins',
      researchHyperspace: 'Research Hyperspace Technology',
      defeatBoss: 'Defeat the mysterious enemy',
      colonizeSpecial: 'Colonize special location',
      continueDevelopment: 'Continue development'
    },
    dialogues: {
      '1_1': {
        prologue_1:
          'Welcome to the galaxy, young commander. This vast universe awaits your exploration. First, let us build up your home planet.',
        prologue_2: 'I sense a new consciousness awakening... Interesting... Let us see how far you can go...'
      },
      '1_2': {
        prologue_1:
          'Basic infrastructure is complete. Now it is time to develop technology. Build a Research Lab and begin your tech journey.'
      },
      '1_3': {
        prologue_1: 'With technology support, you can start building your fleet. Build a Shipyard and produce your first warship.'
      },
      '1_4': {
        prologue_1: 'Your fleet is taking shape. Now let us learn about your surroundings. Send out spy probes to scout nearby factions.',
        prologue_2: 'You are not alone... Other civilizations exist in this galaxy...'
      },
      '1_5': {
        prologue_1: 'You have discovered nearby factions. Diplomacy is an art. Try to establish contact with them.',
        epilogue_1: 'Thank you for your gift, commander. I hope we can become friends.',
        epilogue_2: 'Good... Establishing connections is the first step to uncovering deeper secrets...'
      },
      '2_1': {
        prologue_1:
          'Your power is established. It is time to expand your territory. Research Astrophysics, build a colony ship, and explore new planets.',
        prologue_2: 'The universe is infinite... More planets mean more possibilities...'
      },
      '2_2': {
        prologue_1: 'Colonization successful! But deeper secrets await in the universe. Send your fleet on expedition missions.',
        prologue_2: 'Faint signals from afar... Something awaits you there...'
      },
      '2_3': {
        prologue_1:
          'Your expedition discovered anomalous signals. These signals seem to come from an ancient civilization... Investigate their source.',
        epilogue_1: 'These symbols... They are ruins of an ancient civilization! Continue investigating to uncover their secrets.'
      },
      '2_4': {
        prologue_1: 'You have found the location of ancient ruins. Send your fleet to explore and see what you can discover.'
      },
      '2_5': {
        prologue_1: 'Data archives were found in the ruins. Study this data, perhaps you can unlock new technology.'
      },
      '3_1': {
        prologue_1: 'While exploring, do not forget about diplomacy. Maintaining good relations with surrounding factions benefits you.'
      },
      '3_2': {
        prologue_1: 'Some factions have shown friendliness. Continue deepening relations, perhaps you can gain more support.'
      },
      '3_3': {
        prologue_1: 'Intelligence indicates hostile forces are watching you from the shadows. Stay vigilant and scout their movements.'
      },
      '3_4': {
        prologue_1: 'Establish a formal alliance with friendly factions to support each other against threats.'
      },
      '3_5': {
        prologue_1: 'Threats are approaching. Build defense facilities and prepare for possible conflict.'
      },
      '4_1': {
        prologue_1: 'The enemy has launched an attack! Defend your planet!',
        epilogue_1: "You successfully repelled the enemy's first wave. But this is just the beginning..."
      },
      '4_2': {
        prologue_1: 'The enemy has retreated, but they will return. Scout their planets to understand their strength.'
      },
      '4_3': {
        prologue_1: 'It is time to strike back. Attack the enemy planets and weaken their forces.'
      },
      '4_4': {
        prologue_1: 'Much debris remains on the battlefield. Recycle these resources to prepare for the next battle.'
      },
      '4_5': {
        prologue_1: 'The final battle approaches. Build a powerful fleet and prepare for the ultimate challenge.'
      },
      '5_1': {
        prologue_1: 'All clues point to the deepest part of the ruins. The core secrets of the ancient civilization lie there.',
        prologue_2: 'You have finally arrived... The truth will soon be revealed...'
      },
      '5_2': {
        prologue_1: 'In the depths of the ruins, you discovered lost ancient technology. Research and unlock their power.'
      },
      '5_3': {
        prologue_1: 'A mysterious enemy has appeared. This is the final challenge. Defeat it!',
        epilogue_1: 'You did it! The ancient guardian has been defeated. The secrets of the galaxy are now open to you.'
      },
      '5_4': {
        prologue_1: 'Peace has finally arrived. In this new era, establish new colonies and expand your empire.'
      },
      '5_5': {
        prologue_1: 'Your legend has just begun. Continue exploring and conquering more star systems!',
        epilogue_1: 'The galaxy is vast and boundless, with countless secrets waiting for you to discover...'
      }
    }
  },
  // NPC Enhanced Behavior Notifications
  npcBehavior: {
    // Neutral NPC behavior
    tradeOfferReceived: 'Trade Offer Received',
    tradeOfferDesc: '{npcName} has sent you a trade offer',
    attitudeChanged: 'NPC Attitude Changed',
    becameFriendly: '{npcName} has become friendly towards you',
    becameHostile: '{npcName} has become hostile towards you',
    // Friendly NPC behavior
    intelReceived: 'Intel Received',
    intelReceivedDesc: '{npcName} has shared enemy intelligence with you',
    jointAttackInvite: 'Joint Attack Invitation',
    jointAttackInviteDesc: '{npcName} invites you to attack an enemy together',
    aidReceived: 'Aid Received',
    aidReceivedDesc: '{npcName} has sent you {amount} resources',
    allyDefense: 'Ally Defense',
    allyDefenseDesc: '{npcName} is sending a fleet to help defend your planet',
    // Trade related
    trade: {
      title: 'Trade Offers',
      from: 'From',
      offers: 'Offers',
      requests: 'Requests',
      expiresIn: 'Expires In',
      expired: 'Expired',
      accept: 'Accept',
      decline: 'Decline',
      noOffers: 'No trade offers',
      acceptSuccess: 'Trade completed!',
      acceptFailed: 'Insufficient resources to complete trade',
      declined: 'Trade declined',
      ratio: 'Exchange Ratio'
    },
    // Intel related
    intel: {
      title: 'Intel Reports',
      from: 'Source',
      target: 'Target NPC',
      type: 'Intel Type',
      types: {
        enemyFleet: 'Fleet Intel',
        enemyResources: 'Resource Intel',
        enemyMovement: 'Movement Intel'
      },
      fleetInfo: 'Fleet Information',
      resourceInfo: 'Resource Information',
      movementInfo: 'Movement Information',
      noReports: 'No intel reports',
      markAsRead: 'Mark as Read',
      content: 'Intel Content',
      noFleet: 'No fleet detected',
      noData: 'No data available',
      targetPosition: 'Target Position',
      missionType: 'Mission Type'
    },
    // Joint attack related
    jointAttack: {
      title: 'Joint Attack Invitations',
      from: 'Initiator',
      target: 'Target NPC',
      targetPlanet: 'Target Planet',
      npcFleet: 'NPC Fleet',
      lootShare: 'Loot Share',
      expiresIn: 'Expires In',
      expired: 'Expired',
      accept: 'Join Attack',
      decline: 'Decline',
      noInvites: 'No joint attack invitations',
      acceptSuccess: 'Joined joint attack!',
      declined: 'Invitation declined',
      targetInfo: 'Attack Target',
      expectedShare: 'Expected Share',
      remaining: 'Time Remaining'
    },
    // Aid related
    aid: {
      title: 'Resource Aid',
      from: 'Source',
      resources: 'Aid Resources',
      noAid: 'No aid records'
    },
    // Attitude change related
    attitudeChange: {
      title: 'Attitude Changes',
      npc: 'NPC',
      previous: 'Previous',
      current: 'Current',
      reason: 'Reason',
      reasons: {
        attitude_swing: 'Attitude swing',
        gift: 'Received gift',
        attack: 'Attacked',
        naturalSwing: 'Natural shift',
        giftReceived: 'Received gift',
        attacked: 'Was attacked',
        reputationThreshold: 'Reputation threshold'
      }
    },
    // Ally actions related
    allyAction: {
      title: 'Ally Actions',
      defense: 'Defensive Support',
      defenseDesc: '{npcName} is sending fleet to help defend {targetPlanet}',
      jointAttackStarted: 'Joint Attack Started',
      jointAttackStartedDesc: 'Joint attack on {targetNpc} has begun',
      reputationBonus: 'Reputation Bonus',
      reputationBonusDesc: 'Your ally {npcName} speaks well of you to {targetNpc}'
    }
  }
}
