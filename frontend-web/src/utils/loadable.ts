import { lazy, ComponentType } from 'react';

export const lazyLoad = <T extends ComponentType<any>>(
  loader: () => Promise<{ default: T } | { [key: string]: T }>,
  selector: (module: { default: T } | { [key: string]: T }) => T
) => {
  return lazy(async () => {
    const module = await loader();
    return { default: selector(module) };
  });
};