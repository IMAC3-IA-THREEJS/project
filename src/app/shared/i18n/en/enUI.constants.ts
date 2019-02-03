import { IUITranslationKeys } from '@shared/models/translationKeys.models';

export const EN_UI_TRANSLATION: IUITranslationKeys = {
  menu: {
    new_world_btn: 'New world',
    continue_btn: 'Continue',
  },
  online_count: 'Online {{count}}',
  trophy_unlocked: 'Trophy unlocked',
  home: {
    title: 'Ecosystems',
    subtitle: 'A 3d interactive experience',
    debug: 'Debug',
    loading: 'loading...',
    form: {
      seed: 'Choose a seed',
      seed_placeholder: '',
      graphics: 'Graphics',
      high_quality_option: 'High',
      medium_quality_option: 'Medium',
      low_quality_option: 'Low',
      gamemode: 'Game mode',
      singleplayer_option: 'Singleplayer',
      multiplayer_option: 'Multiplayer',
      soundmode: 'Sound',
      sound_on_option: 'ON',
      sound_off_option: 'OFF',
      start_btn: 'Start',
      seed_tooltip_title: 'What\'s a seed ?',
      seed_tooltip_text: 'The seed can either be a number, a word or a phrase. It\'s used to generate a unique world.',
    }
  },
  trophies: {
    title: 'Trophies',
    sort_by_type: 'Sort by type',
    sort_by_completion_status: 'Sort by completion status',
    sort_by_difficulty: 'Sort by difficulty'
  },
  tutorial: {
    title: 'Tutoriel',
    title_commands: 'Keys',
    title_project: 'Project',
    title_tech: 'Technologies used',
    subtitle_misc: 'Misc.',
    subtitle_mvt: 'Movements',
    key_down: 'Descend',
    key_up: 'Ascend',
    key_right: 'Move right',
    key_left: 'Move left',
    key_back: '',
    key_front: 'Avancer',
    key_vocal: 'Activer/Désactiver les commandes vocales',
    key_reload: 'Générer un nouveau monde',
    key_mute: 'Activer/Désactiver le son',
    key_menu: 'Retour au menu',
    key_menu_name: 'Escape',
    mouse_interaction: 'Interagir',
    mouse_interaction_name: 'Right click',
    article: {
      p1: 'Ecosystems is a project developed by 3rd year IMAC students in the Artificial Intelligence course. The purpose of the project is to experience a 3d interactive world in a web browser.',
      p2: 'You can reload the page anytime you want or click the "New world" button to generate a brand new and unique world. There is a total of {{count}} different biomes to discover.',
      p3: 'Unlock all {{count}} trophies by roaming and searching the worlds.',
      p4: 'The project uses three.js for the rendering, React for the user interface, and tensorflow for voice commands recognition. Some functionalities are still in development and prone to bugs.',
      p5: 'Use a desktop version of Chrome or Firefox for an optimal experience.'
    }
  },
  credits: {
    title: 'Credits',
    description_jeremie: 'Project manager, developer - three.js / React.',
    description_florian: 'Developer - three.js / React / socket.io.',
    description_lucas: 'Gameplay developer - vocal commands with tensorflow.',
    description_jordan: 'Developer - sounds.',
    description_christina: 'UX/UI Designer.'
  },
  progression: {
    title: 'Progression',
    game_played: 'Game played : {{count}}',
    distance_travelled: 'Distance travelled : {{count}} m',
    going_underwater: 'Underwater : {{count}}',
    objects_placed: 'Objects placed : {{count}}',
    unlock_trophies_percentage: 'Trophies unlocked : {{count}}%'
  },
  cookies: {
    more: 'Learn more',
    decline: 'Decline',
    allow: 'Allow cookies',
    message: 'We use cookies to measure how visitors interact with the website.'
  }
};
