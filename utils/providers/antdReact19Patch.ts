'use client';

import { createRoot, type Root } from 'react-dom/client';
import type { ReactElement } from 'react';
import * as antdUnstableContext from 'antd/es/config-provider/UnstableContext';

type MountFn = (
  node: ReactElement,
  container: Element | DocumentFragment,
) => () => Promise<void>;

const rootCache = new WeakMap<Element | DocumentFragment, Root>();

const setAntdRender = (
  antdUnstableContext as Record<string, (render: MountFn) => MountFn>
)['unstableSetRender'];

const registerRender = setAntdRender as unknown as (render: MountFn) => MountFn;

if (typeof window !== 'undefined') {
  registerRender((node, container) => {
    let root = rootCache.get(container);
    if (!root) {
      root = createRoot(container);
      rootCache.set(container, root);
    }
    root.render(node);
    return async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      root.unmount();
      rootCache.delete(container);
    };
  });
}
