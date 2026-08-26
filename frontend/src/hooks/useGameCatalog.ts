import { useEffect, useState } from 'react';
import { getGameCatalog, type GameCatalog } from '../api/gameCatalog';

type CatalogState = {
  data?: GameCatalog;
  error?: string;
  loading: boolean;
};

export function useGameCatalog() {
  const [state, setState] = useState<CatalogState>({ loading: true });

  useEffect(() => {
    let active = true;

    getGameCatalog()
      .then((data) => {
        if (active) {
          setState({ data, loading: false });
        }
      })
      .catch(() => {
        if (active) {
          setState({
            error: 'Nao foi possivel carregar os jogos do backend.',
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
