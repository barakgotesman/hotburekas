import Markdoc, { type Config, type Node } from '@markdoc/markdoc';

// Markdoc -> HTML config. Custom tags declared in keystatic.config.ts (`components`) must be declared here too.
const markdocConfig: Config = {
  tags: {
    // {% tip title="..." %}...{% /tip %} -> <aside class="tip"><strong class="tip-title">...</strong>...</aside>
    // Styled in src/styles/global.css (aside.tip).
    tip: {
      render: 'aside',
      attributes: { title: { type: String } },
      /**
       * Builds the <aside> by hand so the title becomes a <strong> before the content
       * (Markdoc's default `render` would only put the title in an HTML attribute).
       */
      transform(node, config) {
        const title = node.attributes.title as string | undefined;
        const children = node.transformChildren(config);
        return new Markdoc.Tag(
          'aside',
          { class: 'tip' },
          title ? [new Markdoc.Tag('strong', { class: 'tip-title' }, [title]), ...children] : children,
        );
      },
    },
  },
};

/**
 * Renders a Markdoc AST (from a Keystatic `fields.markdoc` value) to an HTML string.
 * Output is meant for Astro's `set:html`.
 * @param node Parsed Markdoc document node. Typed `unknown` because @keystatic/core ships its own
 *   copy of @markdoc/markdoc, whose `Node` type is structurally incompatible with ours.
 */
export function renderMarkdoc(node: unknown): string {
  return Markdoc.renderers.html(Markdoc.transform(node as Node, markdocConfig));
}
