import Component from "@glimmer/component";
import { cached } from "@glimmer/tracking";
import { inject as service } from "@ember/service";
import formatDate from "discourse/helpers/format-date";
import i18n from "discourse-common/helpers/i18n";
import { bind } from "discourse-common/utils/decorators";
import ChannelIcon from "discourse/plugins/chat/discourse/components/channel-icon";
import ChannelTitle from "discourse/plugins/chat/discourse/components/channel-title";
import List from "discourse/plugins/chat/discourse/components/chat/list";
import ThreadTitle from "discourse/plugins/chat/discourse/components/thread-title";
import ChatChannel from "discourse/plugins/chat/discourse/models/chat-channel";
import ChatThread from "discourse/plugins/chat/discourse/models/chat-thread";

export default class UserThreads extends Component {
  @service chat;
  @service chatApi;

  @cached
  get threadsCollection() {
    return this.chatApi.userThreads(this.handleLoadedThreads);
  }

  @bind
  handleLoadedThreads(result) {
    return result.threads.map((threadObject) => {
      const channel = ChatChannel.create(threadObject.channel);
      const thread = ChatThread.create(channel, threadObject);
      const tracking = result.tracking[thread.id];
      if (tracking) {
        thread.tracking.mentionCount = tracking.mention_count;
        thread.tracking.unreadCount = tracking.unread_count;
      }
      return thread;
    });
  }

  <template>
    <List
      @collection={{this.threadsCollection}}
      class="c-user-threads"
      as |list|
    >
      <list.Item as |thread|>
        <div class="c-user-thread" data-id={{thread.id}}>
          <ChannelIcon @channel={{thread}} />
          <ThreadTitle @thread={{thread}} />
          <ChannelTitle @channel={{thread.channel}} />
          <span class="chat-message-thread-indicator__last-reply-timestamp">
            {{formatDate thread.preview.lastReplyCreatedAt leaveAgo="true"}}
          </span>
          <div class="c-user-thread__excerpt">
            {{thread.preview.lastReplyExcerpt}}
          </div>
        </div>
      </list.Item>
      <list.EmptyState>
        <div class="empty-state-threads">
          {{i18n "chat.empty_state.my_threads"}}
        </div>
      </list.EmptyState>
    </List>
  </template>
}
