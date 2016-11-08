import AppEvents from 'discourse/lib/app-events';
import createStore from 'helpers/create-store';
import { autoLoadModules } from 'discourse/initializers/auto-load-modules';
import TopicTrackingState from 'discourse/models/topic-tracking-state';

export default function(name, opts) {
  opts = opts || {};

  test(name, function(assert) {
    const appEvents = AppEvents.create();
    this.site = Discourse.Site.current();

    this.registry.register('site-settings:main', Discourse.SiteSettings, { instantiate: false });
    this.registry.register('app-events:main', appEvents, { instantiate: false });
    this.registry.register('capabilities:main', Ember.Object);
    this.registry.register('site:main', this.site, { instantiate: false });
    this.registry.injection('component', 'siteSettings', 'site-settings:main');
    this.registry.injection('component', 'appEvents', 'app-events:main');
    this.registry.injection('component', 'capabilities', 'capabilities:main');
    this.registry.injection('component', 'site', 'site:main');

    this.siteSettings = Discourse.SiteSettings;

    autoLoadModules(this.registry, this.registry);

    const store = createStore();
    if (!opts.anonymous) {
      const currentUser = Discourse.User.create({ username: 'eviltrout' });
      this.currentUser = currentUser;
      this.registry.register('current-user:main', this.currentUser, { instantiate: false });
      this.registry.register('topic-tracking-state:main',
                              TopicTrackingState.create({ currentUser }),
                              { instantiate: false });
    }

    this.registry.register('store:main', store, { instantiate: false });

    if (opts.setup) {
      if (Ember.VERSION[0] === "2") {
        // use closure actions instead
        this.on = (actionName, fn) => this.set(actionName, fn);
      }

      opts.setup.call(this, store);
    }

    andThen(() => {
      // TODO: This shouldn't be necessary
      this.owner = {
        hasRegistration: (...args) => this.registry.has(...args),
        lookup: (...args) => this.container.lookup(...args),
        _lookupFactory: (...args) => this.container.lookupFactory(...args)
      };

      return this.render(opts.template);
    });
    andThen(() => opts.test.call(this, assert));
  });
}
