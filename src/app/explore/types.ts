import type {ContextLocator} from '../../domain/types';

export type PreviewHandlers = (
  locator: ContextLocator,
) => {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
};

export type SelectTarget = (locator: ContextLocator) => void;
