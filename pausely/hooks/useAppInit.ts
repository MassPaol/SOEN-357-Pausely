import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { useSession } from '../context/sessionStore';

const GROUP_KEY = 'participant_group';
const ID_KEY = 'participant_id';

export function useAppInit() {
  const { setParticipant } = useSession();

  useEffect(() => {
    async function init() {
      let id = await SecureStore.getItemAsync(ID_KEY);
      let group = await SecureStore.getItemAsync(GROUP_KEY);

      if (!id) {
        id = Crypto.randomUUID();
        await SecureStore.setItemAsync(ID_KEY, id);
      }

      if (!group) {
        group = Math.random() < 0.5 ? 'control' : 'experimental';
        await SecureStore.setItemAsync(GROUP_KEY, group);
      }

      setParticipant(id, group as 'control' | 'experimental');
    }

    init();
  }, []);
}
