import * as React from 'react';
import { DatabaseConfigInfo, ConfigJSON } from '../../main/utilities/config';

interface IContext extends CurrentDatabaseProviderState {
  setCurrentDb: (newDb: DatabaseConfigInfo) => void;
  renameCurrentDb: (newName: string) => void;
}

export const CurrentDatabaseContext =
  React.createContext<IContext | null>(null);

export interface CurrentDatabaseProviderProps {}

export interface CurrentDatabaseProviderState {
  currentDb: DatabaseConfigInfo;
}

class CurrentDatabaseProvider extends React.Component<
  CurrentDatabaseProviderProps,
  CurrentDatabaseProviderState
> {
  constructor(props: CurrentDatabaseProviderProps) {
    super(props);
    this.state = {
      currentDb: { alias: '', path: '' },
    };
  }

  componentDidMount = () => {
    window.api
      .invoke('get-databases')
      .then((res: ConfigJSON) => {
        const { currentDb } = this.state;
        currentDb.path = res.currentDb.path;
        currentDb.alias = res.currentDb.alias;
        this.setState({ currentDb });
        return res;
      })
      .catch((err) => console.log(err));
  };

  setCurrentDb = (newDb: DatabaseConfigInfo) => {
    this.setState({ currentDb: newDb });
  };

  renameCurrentDb = (newName: string) => {
    const { currentDb } = this.state;
    currentDb.alias = newName;
    this.setState({ currentDb });
  };

  render() {
    const { children } = this.props;
    return (
      <CurrentDatabaseContext.Provider
        value={{
          ...this.state,
          setCurrentDb: this.setCurrentDb,
          renameCurrentDb: this.renameCurrentDb,
        }}
      >
        {children}
      </CurrentDatabaseContext.Provider>
    );
  }
}

export default CurrentDatabaseProvider;
