import React from 'react';

import UIState from '@ui/UIState';
import UIHomeState from '@ui/states/UIHomeState';
import UIGameState from '@ui/states/UIGameState';
import UIService, { uiSvc } from '@ui/services/ui.service';

import { UI_STATES } from '@ui/enums/UIStates.enum';
interface IUIManagerProps {

}

interface IUIManagerState {
  currentUiStateID: number;
}

class UIManager extends React.PureComponent<IUIManagerProps, IUIManagerState> {
  static readonly ENABLED: boolean = true;

  private states: Map<UI_STATES, UIState>;

  private uiSvc: UIService;

  constructor(props: IUIManagerProps) {
    super(props);

    this.state = {
      currentUiStateID: UI_STATES.HOME
    };

    this.uiSvc = uiSvc;

    this.uiSvc.switchState(this.state.currentUiStateID);

    this.states = new Map<UI_STATES, UIState>();
    this.addState(UI_STATES.HOME, new UIHomeState());
    this.addState(UI_STATES.PLAY, new UIGameState());
  }

  render() {
    const uiState = this.states.get(this.state.currentUiStateID);
    console.log('render', uiState);

    return (
      <div className='ui full'>
        <div className='ui__state'>
          {uiState && uiState.render()}
        </div>
      </div>
    );
  }

  private addState(key: UI_STATES, value: UIState) {
    if (!this.states.has(key)) {
      value.init();
      this.states.set(key, value);
    }
  }

  public switchState(state: UI_STATES) {
    this.setState({ currentUiStateID: state });
    this.uiSvc.switchState(state);
  }
}

export default UIManager;
