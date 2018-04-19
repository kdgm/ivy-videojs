import Ember from 'ember';
import videojs from 'videojs';

const Button = videojs.getComponent('Button');

class SwitchMediaButton extends Button {
  constructor(player, options) {
    super(player, options);
  }
  buildCSSClass() {
    return `vjs-switch-media-button ${super.buildCSSClass()}`;
  }
}

class SkipForwardButton extends Button {
  constructor(player, options) {
    super(player, options);
  }
  buildCSSClass() {
    return `vjs-skip-forward icon pref10 ${super.buildCSSClass()}`;
  }
}

class SkipBackwardButton extends Button {
  constructor(player, options) {
    super(player, options);
  }
  buildCSSClass() {
    return `vjs-skip-back icon next10 ${super.buildCSSClass()}`;
  }
}

videojs.registerComponent('SwitchMediaButton', SwitchMediaButton);

videojs.registerComponent('SkipForwardButton', SkipForwardButton);

videojs.registerComponent('SkipBackwardButton', SkipBackwardButton);

/**
 * Renders a `video` element, and applies a video.js player to it. Also
 * provides some methods for binding properties to the player, and for proxying
 * player events to actions.
 *
 * This is the lower-level component that `ivy-videojs` uses internally.
 *
 * @class
 * @extends Ember.Component
 */
export default Ember.Component.extend({

  tagName: 'video',

  classNames: ['video-js'],

  mergedProperties: ['playerEvents'],

  secondsToSkip: 10,

  /**
   * The set of video.js player events (and associated actions) to be set up
   * inside `didInsertElement`. If you need to respond to custom video.js
   * player events, such as those emitted by a plugin, you should do so by
   * calling `sendActionOnPlayerEvent` inside your `ready` handler.
   *
   * ```javascript
   * import Ember from 'ember';
   *
   * export default Ember.Controller.extend({
   *   actions: {
   *     ready(player, component) {
   *       component.sendActionOnPlayerEvent(player, 'actionName', 'eventName');
   *     }
   *   }
   * });
   * ```
   *
   * The above would send the `actionName` action in response to an `eventName`
   * event from the player.
   *
   * @property playerEvents
   * @type Object
   * @private
   */
  playerEvents: {
    abort: 'abort',
    canplay: 'canplay',
    canplaythrough: 'canplaythrough',
    durationchange: 'durationchange',
    emptied: 'emptied',
    ended: 'ended',
    error: 'error',
    loadeddata: 'loadeddata',
    loadedmetadata: 'loadedmetadata',
    loadstart: 'loadstart',
    pause: 'pause',
    play: 'play',
    playing: 'playing',
    progress: 'progress',
    ratechange: 'ratechange',
    resize: 'resize',
    seeked: 'seeked',
    seeking: 'seeking',
    stalled: 'stalled',
    suspend: 'suspend',
    timeupdate: 'timeupdate',
    useractive: 'useractive',
    userinactive: 'userinactive',
    volumechange: 'volumechange',
    waiting: 'waiting'
  },

  /**
   * Sets up a (one-way) binding for a property from this component to the
   * video.js player. If the property is changed, it will be propagated to the
   * video.js player (via `setPlayerProperty`).
   *
   * @method bindPropertyToPlayer
   * @param {Player} player the video.js player instance
   * @param {String} property the component property to bind
   * @param {String} playerProperty the video.js player property
   * @see {#setPlayerProperty}
   */
  bindPropertyToPlayer(player, property, playerProperty=property) {
    const observer = function() {
      this.setPlayerProperty(player, playerProperty, this.get(property));
    };

    const scheduledObserver = function() {
      Ember.run.scheduleOnce('render', this, observer);
    };

    this._addPlayerObserver(property, this, scheduledObserver);

    // Invoke the observer once to set the initial value on the player.
    observer.call(this);
  },


  didInsertElement(){
    this.addPlayer();
  },

  didRender(){
    this.updateCustomControls();
  },

  willDestroyElement(){
    if (this.get('player')) {
      this.get('player').dispose();
    }
  },

  addPlayer(){
    this.set('player',  videojs(this.get('element'), this.get('setup')));

    this.get('player').ready(() => {
      // Set up event listeners defined in `playerEvents`.
      const playerEvents = this.get('playerEvents');
      let player = this.get('player');
      if (playerEvents) {
        for (let key in playerEvents) {
          if (!playerEvents.hasOwnProperty(key)) { continue; }
          this.sendActionOnPlayerEvent(player, key, playerEvents[key]);
        }
      }

      // Let the outside world know that we're ready.
      this.sendAction('ready', player, this);
    });
  },

  updateCustomControls(){
    let controlBar = this.get('player').controlBar;

    // Add switchMedia button if switchMediaEnabled = true and if not present
    if (this.get('switchMediaEnabled') && !controlBar.getChild('SwitchMediaButton')) {
      let switchMediaButton = controlBar.addChild('SwitchMediaButton');
      switchMediaButton.on('click', () => { this.sendAction('switchMedia'); });
    }
    // Remove button if switchMediaEnabled = false and button is present
    if (!this.get('switchMediaEnabled') && controlBar.getChild('SwitchMediaButton')) {
      controlBar.removeChild('SwitchMediaButton');
    }

    // Add skip buttons if not present
    if (!controlBar.getChild('SkipForwardButton')){
      let skipForwardButton = controlBar.addChild('SkipForwardButton');
      skipForwardButton.on('click', () => { this.send('skipForward'); });

      let skipBackwardButton = controlBar.addChild('SkipBackwardButton');
      skipBackwardButton.on('click', () => { this.send('skipBackward'); });
    }
  },

  /**
   * Sets up a listener that sends an action on a video.js player event.
   *
   * @method sendActionOnPlayerEvent
   * @param {Player} player the video.js player instance
   * @param {String} action the action name to be sent
   * @param {String} playerEvent the player event name to listen for
   */
  sendActionOnPlayerEvent(player, action, playerEvent=action) {
    const listenerFunction = (...args) => {
      this.sendAction(action, player, this, ...args);
    };

    this._onPlayerEvent(player, playerEvent, listenerFunction);
  },

  /**
   * Sets the value of a property on a video.js player. If the property is
   * already equal to the given value, no change is made.
   *
   * @method setPlayerProperty
   * @param {Player} player the video.js player instance
   * @param {String} playerProperty the name of the property to set
   * @param {Object} value the value to set
   */
  setPlayerProperty(player, playerProperty, value) {
    const propertyMethod = player[playerProperty];
    if (propertyMethod && value !== undefined) {
      const previousValue = propertyMethod.call(player);
      if (previousValue !== value) {
        propertyMethod.call(player, value);
      }
    }
  },

  _addPlayerObserver(property, target, observer) {
    if (this.isDestroying) {
      return;
    }

    this.addObserver(property, target, observer);

    this.one('willDestroyElement', this, function() {
      this.removeObserver(property, target, observer);
    });
  },

  _onPlayerEvent(player, eventName, listenerFunction) {
    player.on(eventName, listenerFunction);
  },

  actions: {
    skipForward() {
      let currentTime = this.get('player').currentTime();
      this.get('player').currentTime(currentTime + this.get('secondsToSkip'));
    },
    skipBackward() {
      let currentTime = this.get('player').currentTime();
      this.get('player').currentTime(currentTime - this.get('secondsToSkip'));
    }
  }

});
