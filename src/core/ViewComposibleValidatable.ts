import {ComposibleValidatable} from "./types";
import {ViewValidatable} from "./ViewValidatable";

export abstract class ViewComposibleValidatable<Wrapped, TValue>
  extends ViewValidatable<Wrapped, TValue>
  implements ComposibleValidatable<TValue> {

  protected wrapped: ComposibleValidatable<Wrapped>;

  constructor(wrapped: ComposibleValidatable<Wrapped>, to: (t: Wrapped) => TValue) {
    super(wrapped, to);
    this.wrapped = wrapped;
  };

  on$ChangeAfterValidation() {
    return this.wrapped.on$ChangeAfterValidation()
  };

  on$Reinit() {
    this.wrapped.on$Reinit()
  }

  setCompositionParent(c: { on$ChangeAfterValidation: () => void; on$Reinit: () => void; }) {
    return this.wrapped.setCompositionParent(c)
  };
}
