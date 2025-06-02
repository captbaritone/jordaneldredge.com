import { unstable_ViewTransition as ViewTransition } from "react";

export const ContentViewTransition = make("content-list-item");
export const ContentTileViewTransition = make("content-title");
export const ContentDateViewTransition = make("content-date");

type Props = {
  id?: string;
  children: React.ReactNode;
};

function make(prefix: string): (props: Props) => React.ReactNode {
  const component = function Component({ id, children }) {
    if (id == null) {
      return <>{children}</>;
    }
    return <ViewTransition name={`${prefix}-${id}`}>{children}</ViewTransition>;
  };
  component.displayName = `ViewTransition(${prefix})`;
  return component;
}
