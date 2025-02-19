import type React from 'react';
import type { BaseInputProps, InputProps } from '../interface';

export function hasAddon(props: BaseInputProps | InputProps) {
  return !!(props.addonBefore || props.addonAfter);
}

export function hasPrefixSuffix(props: BaseInputProps | InputProps) {
  return !!(props.prefix || props.suffix || props.allowClear);
}

export function resolveOnChange<
  E extends HTMLInputElement | HTMLTextAreaElement,
>(
  target: E,
  e:
    | React.ChangeEvent<E>
    | React.MouseEvent<HTMLElement, MouseEvent>
    | React.CompositionEvent<HTMLElement>,
  onChange: undefined | ((event: React.ChangeEvent<E>) => void),
  targetValue?: string,
) {
  if (!onChange) {
    return;
  }
  let event = e;

  if (e.type === 'click') {
    // Clone a new target for event.
    // Avoid the following usage, the setQuery method gets the original value.
    //
    // const [query, setQuery] = React.useState('');
    // <Input
    //   allowClear
    //   value={query}
    //   onChange={(e)=> {
    //     setQuery((prevStatus) => e.target.value);
    //   }}
    // />

    // A bug report filed on WebKit's Bugzilla tracker, dating back to 2009, specifically addresses the issue of cloneNode() not copying files of <input type="file"> elements.
    // As of the last update, this bug was still marked as "NEW," indicating that it might not have been resolved yet​​.
    // https://bugs.webkit.org/show_bug.cgi?id=28123
    const currentTarget = target.cloneNode(true) as E;

    // click clear icon
    event = Object.create(e, {
      target: { value: currentTarget },
      currentTarget: { value: currentTarget },
    });

    currentTarget.value = '';
    onChange(event as React.ChangeEvent<E>);
    return;
  }

  // Trigger by composition event, this means we need force change the input value
  // https://github.com/ant-design/ant-design/issues/45737
  // https://github.com/ant-design/ant-design/issues/46598
  if (target.type !== 'file' && targetValue !== undefined) {
    // A bug report filed on WebKit's Bugzilla tracker, dating back to 2009, specifically addresses the issue of cloneNode() not copying files of <input type="file"> elements.
    // As of the last update, this bug was still marked as "NEW," indicating that it might not have been resolved yet​​.
    // https://bugs.webkit.org/show_bug.cgi?id=28123
    const currentTarget = target.cloneNode(true) as E;

    event = Object.create(e, {
      target: { value: currentTarget },
      currentTarget: { value: currentTarget },
    });
    currentTarget.value = targetValue;
    onChange(event as React.ChangeEvent<E>);
    return;
  }
  onChange(event as React.ChangeEvent<E>);
}

export interface InputFocusOptions extends FocusOptions {
  cursor?: 'start' | 'end' | 'all';
}

export function triggerFocus(
  element?: HTMLInputElement | HTMLTextAreaElement,
  option?: InputFocusOptions,
) {
  if (!element) return;

  element.focus(option);

  // Selection content
  const { cursor } = option || {};
  if (cursor) {
    const len = element.value.length;

    switch (cursor) {
      case 'start':
        element.setSelectionRange(0, 0);
        break;

      case 'end':
        element.setSelectionRange(len, len);
        break;

      default:
        element.setSelectionRange(0, len);
    }
  }
}
