import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Connector, ConnectorStatus } from './connectorRegistry';

const STORAGE_KEY = 'zouk_connector_state_v1';

export interface ConnectorRuntimeState {
  status: ConnectorStatus;
  authType: Connector['authType'];
  lastConnectedAt?: string;
  label?: string;
  credentialPreview?: string;
  error?: string;
}

export type ConnectorStateMap = Record<string, ConnectorRuntimeState>;

export interface ConnectorSaveInput {
  credential?: string;
  label?: string;
}

function safeReadState(): ConnectorStateMap {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConnectorStateMap) : {};
  } catch (error) {
    console.warn('Failed to read Zouk connector state', error);
    return {};
  }
}

function safeWriteState(state: ConnectorStateMap) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save Zouk connector state', error);
  }
}

export function maskCredential(value = '') {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length <= 8) {
    return `${trimmed.slice(0, 2)}••••`;
  }

  return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`;
}

export function useConnectorState(registry: Connector[]) {
  const [state, setState] = useState<ConnectorStateMap>(() => safeReadState());

  useEffect(() => {
    safeWriteState(state);
  }, [state]);

  const getRuntime = useCallback((id: string): ConnectorRuntimeState | undefined => state[id], [state]);

  const getStatus = useCallback(
    (id: string): ConnectorStatus => {
      return state[id]?.status ?? 'disconnected';
    },
    [state],
  );

  const markPending = useCallback((connector: Connector) => {
    setState((prev) => ({
      ...prev,
      [connector.id]: {
        ...prev[connector.id],
        status: 'pending',
        authType: connector.authType,
        error: undefined,
      },
    }));
  }, []);

  const markConnected = useCallback((connector: Connector, input: ConnectorSaveInput = {}) => {
    setState((prev) => ({
      ...prev,
      [connector.id]: {
        status: 'connected',
        authType: connector.authType,
        lastConnectedAt: new Date().toISOString(),
        label: input.label,
        credentialPreview: maskCredential(input.credential),
      },
    }));
  }, []);

  const markError = useCallback((connector: Connector, error: string) => {
    setState((prev) => ({
      ...prev,
      [connector.id]: {
        ...prev[connector.id],
        status: 'error',
        authType: connector.authType,
        error,
      },
    }));
  }, []);

  const disconnect = useCallback((connector: Connector) => {
    setState((prev) => ({
      ...prev,
      [connector.id]: {
        status: 'disconnected',
        authType: connector.authType,
      },
    }));
  }, []);

  const connectedCount = useMemo(
    () => registry.filter((connector) => getStatus(connector.id) === 'connected').length,
    [registry, getStatus],
  );

  return {
    state,
    connectedCount,
    getRuntime,
    getStatus,
    markPending,
    markConnected,
    markError,
    disconnect,
  };
}
