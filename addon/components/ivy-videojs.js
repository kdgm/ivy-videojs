import Ember from 'ember';
import layout from '../templates/components/ivy-videojs';

function proxyAction(action) {
  return function(...args) {
    this.sendAction(action, ...args);
  };
}

/**
 * Provides a simplified interface to the underlying `ivy-videojs-source`
 * component, which should (hopefully) be sufficient for most use cases.
 *
 * @class
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  classNames: 'ivy-videojs',
  concatenatedProperties: ['playerAttributeBindings'],

  /**
   * Properties which will be bound to the video.js player.
   *
   * @property playerAttributeBindings
   * @type Array
   * @private
   */
  playerAttributeBindings: [
    'autoplay',
    'controls',
    'fluid',
    'language',
    'logo',
    'loop',
    'muted',
    'playbackRate',
    'poster',
    'preload',
    'src',
    'volume',
    'currentTime',
  ],

  actions: {
    abort: proxyAction('abort'),
    canplay: proxyAction('canplay'),
    canplaythrough: proxyAction('canplaythrough'),
    durationchange: proxyAction('durationchange'),
    emptied: proxyAction('emptied'),
    ended: proxyAction('ended'),
    error: proxyAction('error'),
    loadeddata: proxyAction('loadeddata'),
    loadedmetadata: proxyAction('loadedmetadata'),
    loadstart: proxyAction('loadstart'),
    play: proxyAction('play'),
    playing: proxyAction('playing'),
    progress: proxyAction('progress'),
    pause: proxyAction('pause'),
    ratechange: proxyAction('ratechange'),
    resize: proxyAction('resize'),
    seeked: proxyAction('seeked'),
    seeking: proxyAction('seeking'),
    stalled: proxyAction('stalled'),
    suspend: proxyAction('suspend'),
    timeupdate: proxyAction('timeupdate'),
    useractive: proxyAction('useractive'),
    userinactive: proxyAction('userinactive'),
    volumechange: proxyAction('volumechange'),
    waiting: proxyAction('waiting'),

    ready(player, component, ...args) {
      this.setupPlayerAttributeBindings(player, component);
      this.sendAction('ready', player, component, ...args);
    }
  },

  layout: layout,

  /**
   * Set up property bindings for each property defined in
   * `playerAttributeBindings`.
   *
   * @method setupPlayerAttributeBindings
   */
  setupPlayerAttributeBindings(player, component) {
    this.get('playerAttributeBindings').forEach(function(property) {
      component.bindPropertyToPlayer(player, property);
    });
  }
});
