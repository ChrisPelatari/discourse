import Component from "@glimmer/component";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import concatClass from "discourse/helpers/concat-class";
import { bind } from "discourse-common/utils/decorators";

export default class IframedHtml extends Component {
  @bind
  writeHtml(element) {
    const iframeDoc = element.contentWindow.document;
    iframeDoc.open("text/html", "replace");
    iframeDoc.write(this.args.html);
    iframeDoc.close();
  }

  <template>
    <iframe
      {{didInsert this.writeHtml}}
      sandbox="allow-same-origin"
      class={{concatClass (if @html "iframed-html") @className}}
      ...attributes
    ></iframe>
  </template>
}
