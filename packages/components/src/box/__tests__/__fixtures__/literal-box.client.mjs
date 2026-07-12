import { template as _$template } from "@solidjs/web";
import { className as _$className } from "@solidjs/web";
import { effect as _$effect } from "@solidjs/web";
import { getNextElement as _$getNextElement } from "@solidjs/web";
import { scope as _$scope } from "@solidjs/web";
import { insert as _$insert } from "@solidjs/web";
var _tmpl$ = /*#__PURE__*/_$template(`<div data-testid=ssr-box>`);
export function LiteralBox(props) {
  var _el$ = _$getNextElement(_tmpl$);
  _$insert(_el$, _$scope(() => props.children));
  _$effect(() => props.class, (_v$, _$p) => {
    _$className(_el$, _v$, _$p);
  });
  return _el$;
}