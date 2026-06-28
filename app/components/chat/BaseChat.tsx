/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import type { JSONValue, Message } from 'ai';
import React, { type RefCallback, useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { ZoukSidebar } from '~/components/sidebar/ZoukSidebar';
import { OnboardingOverlay } from '~/components/zouk/OnboardingOverlay';
import { SkillsAgentsScreen } from '~/components/zouk/SkillsAgentsScreen';
import { LibraryScreen } from '~/components/zouk/LibraryScreen';
import { ConnectorsScreen } from '~/components/zouk/ConnectorsScreen';
import { ProjectsScreen } from '~/components/zouk/ProjectsScreen';
import { TasksScreen } from '~/components/zouk/TasksScreen';
import { SettingsScreen } from '~/components/zouk/SettingsScreen';
import { BuilderWorkspace } from '~/components/zouk/BuilderWorkspace';
import { AgentModeScreen } from '~/components/zouk/AgentModeScreen';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import { PROVIDER_LIST } from '~/utils/constants';
import { ZOUK_PRESET_ID, ZOUK_PROVIDER_NAME, resolveZoukModel } from '~/lib/zouk/modelRegistry';
import { Messages } from './Messages.client';
import { getApiKeysFromCookies } from './APIKeyManager';
import Cookies from 'js-cookie';
import * as Tooltip from '@radix-ui/react-tooltip';
import styles from './BaseChat.module.scss';
import type { ProviderInfo } from '~/types/model';
import type { ActionAlert, SupabaseAlert, DeployAlert, LlmErrorAlertType } from '~/types/actions';
import DeployChatAlert from '~/components/deploy/DeployAlert';
import ChatAlert from './ChatAlert';
import ProgressCompilation from './ProgressCompilation';
import type { ProgressAnnotation } from '~/types/context';
import { SupabaseChatAlert } from '~/components/chat/SupabaseAlert';
import { expoUrlAtom } from '~/lib/stores/qrCodeStore';
import { useStore } from '@nanostores/react';
import { StickToBottom, useStickToBottomContext } from '~/lib/hooks';
import { ChatBox } from './ChatBox';
import type { DesignScheme } from '~/types/design-scheme';
import type { ElementInfo } from '~/components/workbench/Inspector';
import LlmErrorAlert from './LLMApiAlert';

const TEXTAREA_MIN_HEIGHT = 76;

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  onStreamingChange?: (streaming: boolean) => void;
  messages?: Message[];
  description?: string;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  model?: string;
  setModel?: (model: string) => void;
  provider?: ProviderInfo;
  setProvider?: (provider: ProviderInfo) => void;
  providerList?: ProviderInfo[];
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  importChat?: (description: string, messages: Message[]) => Promise<void>;
  exportChat?: () => void;
  uploadedFiles?: File[];
  setUploadedFiles?: (files: File[]) => void;
  imageDataList?: string[];
  setImageDataList?: (dataList: string[]) => void;
  actionAlert?: ActionAlert;
  clearAlert?: () => void;
  supabaseAlert?: SupabaseAlert;
  clearSupabaseAlert?: () => void;
  deployAlert?: DeployAlert;
  clearDeployAlert?: () => void;
  llmErrorAlert?: LlmErrorAlertType;
  clearLlmErrorAlert?: () => void;
  data?: JSONValue[] | undefined;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  append?: (message: Message) => void;
  designScheme?: DesignScheme;
  setDesignScheme?: (scheme: DesignScheme) => void;
  selectedElement?: ElementInfo | null;
  setSelectedElement?: (element: ElementInfo | null) => void;
  addToolResult?: ({ toolCallId, result }: { toolCallId: string; result: any }) => void;
  onWebSearchResult?: (result: string) => void;
}

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      onStreamingChange,
      model,
      setModel,
      provider,
      setProvider,
      providerList,
      input = '',
      enhancingPrompt,
      handleInputChange,

      // promptEnhanced,
      enhancePrompt,
      sendMessage,
      handleStop,
      importChat: _importChat,
      exportChat,
      uploadedFiles = [],
      setUploadedFiles,
      imageDataList = [],
      setImageDataList,
      messages,
      actionAlert,
      clearAlert,
      deployAlert,
      clearDeployAlert,
      supabaseAlert,
      clearSupabaseAlert,
      llmErrorAlert,
      clearLlmErrorAlert,
      data,
      chatMode,
      setChatMode,
      append,
      designScheme,
      setDesignScheme,
      selectedElement,
      setSelectedElement,
      addToolResult = () => {
        throw new Error('addToolResult not implemented');
      },
      onWebSearchResult,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const [apiKeys, setApiKeys] = useState<Record<string, string>>(getApiKeysFromCookies());
    const [zoukSelectedModel, setZoukSelectedModel] = useState(ZOUK_PRESET_ID);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const [transcript, setTranscript] = useState('');
    const [progressAnnotations, setProgressAnnotations] = useState<ProgressAnnotation[]>([]);
    const [zoukSection, setZoukSection] = useState('home');

    const handleZoukSection = (s: string) => {
      setZoukSection(s);

      // Builder gets full-screen — collapse the sidebar automatically
      if (s === 'builder-workshop') {
        setSidebarCollapsed(true);
      }
    };

    // Onboarding: show once until user submits name+email
    const [showOnboarding, setShowOnboarding] = useState(() => {
      if (typeof window === 'undefined') {
        return false;
      }

      return !localStorage.getItem('zouk_user_name');
    });
    const [zoukUserName, setZoukUserName] = useState(() =>
      typeof window !== 'undefined' ? (localStorage.getItem('zouk_user_name') ?? 'Workspace') : 'Workspace',
    );
    const [zoukUserEmail, setZoukUserEmail] = useState(() =>
      typeof window !== 'undefined' ? (localStorage.getItem('zouk_user_email') ?? '') : '',
    );

    const handleOnboardingComplete = (name: string, email: string, openrouterKey: string) => {
      localStorage.setItem('zouk_user_name', name);
      localStorage.setItem('zouk_user_email', email);
      setZoukUserName(name);
      setZoukUserEmail(email);
      setShowOnboarding(false);

      if (openrouterKey) {
        onApiKeysChange(ZOUK_PROVIDER_NAME, openrouterKey);
      }
    };

    const handleSaveProfile = (name: string, email: string) => {
      localStorage.setItem('zouk_user_name', name);
      localStorage.setItem('zouk_user_email', email);
      setZoukUserName(name);
      setZoukUserEmail(email);
    };

    const insertChatPrompt = (prompt: string) => {
      if (handleInputChange) {
        handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLTextAreaElement>);
      }

      setZoukSection('home');
    };

    const expoUrl = useStore(expoUrlAtom);
    const [qrModalOpen, setQrModalOpen] = useState(false);

    useEffect(() => {
      if (expoUrl) {
        setQrModalOpen(true);
      }
    }, [expoUrl]);

    useEffect(() => {
      const resolved = resolveZoukModel(zoukSelectedModel);
      setModel?.(resolved);

      const openrouterProvider = (providerList || (PROVIDER_LIST as ProviderInfo[])).find(
        (p) => p.name === ZOUK_PROVIDER_NAME,
      );

      if (openrouterProvider) {
        setProvider?.(openrouterProvider as ProviderInfo);
      }
    }, [zoukSelectedModel]);

    useEffect(() => {
      if (data) {
        const progressList = data.filter(
          (x) => typeof x === 'object' && (x as any).type === 'progress',
        ) as ProgressAnnotation[];
        setProgressAnnotations(progressList);
      }
    }, [data]);
    useEffect(() => {
      console.log(transcript);
    }, [transcript]);

    useEffect(() => {
      onStreamingChange?.(isStreaming);
    }, [isStreaming, onStreamingChange]);

    useEffect(() => {
      if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');

          setTranscript(transcript);

          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: transcript },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        setRecognition(recognition);
      }
    }, []);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        try {
          setApiKeys(getApiKeysFromCookies());
        } catch (error) {
          console.error('Error loading API keys from cookies:', error);
          Cookies.remove('apiKeys');
        }
      }
    }, []);

    const onApiKeysChange = (providerName: string, apiKey: string) => {
      const newApiKeys = { ...apiKeys, [providerName]: apiKey };
      setApiKeys(newApiKeys);
      Cookies.set('apiKeys', JSON.stringify(newApiKeys));
    };

    const startListening = () => {
      if (recognition) {
        recognition.start();
        setIsListening(true);
      }
    };

    const stopListening = () => {
      if (recognition) {
        recognition.stop();
        setIsListening(false);
      }
    };

    const handleSendMessage = (event: React.UIEvent, messageInput?: string) => {
      if (sendMessage) {
        sendMessage(event, messageInput);
        setSelectedElement?.(null);

        if (recognition) {
          recognition.abort(); // Stop current recognition
          setTranscript(''); // Clear transcript
          setIsListening(false);

          // Clear the input by triggering handleInputChange with empty value
          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: '' },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        }
      }
    };

    const handleFileUpload = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (file) {
          const reader = new FileReader();

          reader.onload = (e) => {
            const base64Image = e.target?.result as string;
            setUploadedFiles?.([...uploadedFiles, file]);
            setImageDataList?.([...imageDataList, base64Image]);
          };
          reader.readAsDataURL(file);
        }
      };

      input.click();
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;

      if (!items) {
        return;
      }

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();

          const file = item.getAsFile();

          if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
              const base64Image = e.target?.result as string;
              setUploadedFiles?.([...uploadedFiles, file]);
              setImageDataList?.([...imageDataList, base64Image]);
            };
            reader.readAsDataURL(file);
          }

          break;
        }
      }
    };

    const baseChat = (
      <div
        ref={ref}
        className={classNames(styles.BaseChat, 'relative flex h-full w-full overflow-hidden')}
        data-chat-visible={showChat}
      >
        {showOnboarding && <OnboardingOverlay onComplete={handleOnboardingComplete} />}
        {chatStarted ? (
          <ClientOnly>{() => <Menu />}</ClientOnly>
        ) : (
          <ZoukSidebar
            section={zoukSection}
            onSection={handleZoukSection}
            userName={zoukUserName}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          />
        )}
        <div className="flex flex-col lg:flex-row overflow-y-auto w-full h-full">
          <div
            className={classNames(
              styles.Chat,
              'flex flex-col flex-grow lg:min-w-[var(--chat-min-width)] h-full relative',
            )}
          >
            {/* ZOUK video background — only on landing home section */}
            {!chatStarted && zoukSection === 'home' && (
              <>
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  src="/bg-loop.mp4"
                  poster="/bg-hero.png"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                />
              </>
            )}
            {/* ZOUK section screens */}
            {!chatStarted && zoukSection === 'agent-mode' && <AgentModeScreen />}
            {!chatStarted && zoukSection === 'skills-agents' && <SkillsAgentsScreen onUseInChat={insertChatPrompt} />}
            {!chatStarted && zoukSection === 'library' && <LibraryScreen />}
            {!chatStarted && zoukSection === 'connectors' && <ConnectorsScreen />}
            {!chatStarted && zoukSection === 'projects' && (
              <ProjectsScreen onOpen={(name) => insertChatPrompt(`Continue working on the project: ${name}. `)} />
            )}
            {!chatStarted && zoukSection === 'tasks' && (
              <TasksScreen onContinue={(name) => insertChatPrompt(`Continue the task: ${name}. `)} />
            )}
            {!chatStarted && zoukSection === 'settings' && (
              <SettingsScreen
                userName={zoukUserName}
                userEmail={zoukUserEmail}
                onSaveProfile={handleSaveProfile}
                onNavigate={handleZoukSection}
                zoukModel={zoukSelectedModel}
                setZoukModel={setZoukSelectedModel}
              />
            )}
            {!chatStarted && zoukSection === 'builder-workshop' && (
              <BuilderWorkspace
                onBack={() => {
                  setZoukSection('home');
                  setSidebarCollapsed(false);
                }}
                zoukModel={zoukSelectedModel}
                setZoukModel={setZoukSelectedModel}
              />
            )}
            {(chatStarted || zoukSection === 'home') && (
              <StickToBottom
                className={classNames('px-2 sm:px-6 relative', {
                  'pt-6 h-full flex flex-col modern-scrollbar': chatStarted,
                  'h-full flex flex-col pb-6': !chatStarted,
                })}
                style={!chatStarted ? { zIndex: 2 } : undefined}
                resize="smooth"
                initial="smooth"
              >
                <StickToBottom.Content className="flex flex-col gap-4 relative">
                  {/* Spacer reserves top area so center branding (ring/logo) stays visible */}
                  {!chatStarted && <div style={{ minHeight: '22vh' }} />}
                  {!chatStarted && (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '0 32px',
                        paddingBottom: 16,
                      }}
                    >
                      <h1
                        style={{
                          fontSize: 'clamp(28px, 4vw, 40px)',
                          fontWeight: 600,
                          color: '#f4f4f4',
                          letterSpacing: '-0.5px',
                          marginBottom: 10,
                          textShadow: '0 2px 26px rgba(0,0,0,0.6)',
                        }}
                      >
                        What can I <span style={{ color: '#ec1d2e' }}>build</span> for you?
                      </h1>
                      <p style={{ color: '#9a9a9a', fontSize: 16 }}>
                        Describe the campaign or project you want to build.
                      </p>
                    </div>
                  )}
                  <ClientOnly>
                    {() => {
                      return chatStarted ? (
                        <Messages
                          className="flex flex-col w-full flex-1 max-w-chat pb-4 mx-auto z-1"
                          messages={messages}
                          isStreaming={isStreaming}
                          append={append}
                          chatMode={chatMode}
                          setChatMode={setChatMode}
                          provider={provider}
                          model={model}
                          addToolResult={addToolResult}
                        />
                      ) : null;
                    }}
                  </ClientOnly>
                  <ScrollToBottom />
                </StickToBottom.Content>
                <div
                  className={classNames('flex flex-col gap-2 mx-auto z-prompt mb-6', {
                    'sticky bottom-2 w-full max-w-chat': chatStarted,
                  })}
                  style={
                    !chatStarted
                      ? {
                          width: '100%',
                          maxWidth: 820,
                          borderRadius: 18,
                          border: '1px solid rgba(236,29,46,0.45)',
                          background: 'linear-gradient(180deg, #0b0809, #060606)',
                          boxShadow: '0 0 40px rgba(236,29,46,0.12), inset 0 0 30px rgba(0,0,0,0.5)',
                          overflow: 'hidden',
                          animation: 'breathe 3s ease-in-out infinite',
                        }
                      : undefined
                  }
                >
                  <div className="flex flex-col gap-2">
                    {deployAlert && (
                      <DeployChatAlert
                        alert={deployAlert}
                        clearAlert={() => clearDeployAlert?.()}
                        postMessage={(message: string | undefined) => {
                          sendMessage?.({} as any, message);
                          clearSupabaseAlert?.();
                        }}
                      />
                    )}
                    {supabaseAlert && (
                      <SupabaseChatAlert
                        alert={supabaseAlert}
                        clearAlert={() => clearSupabaseAlert?.()}
                        postMessage={(message) => {
                          sendMessage?.({} as any, message);
                          clearSupabaseAlert?.();
                        }}
                      />
                    )}
                    {actionAlert && (
                      <ChatAlert
                        alert={actionAlert}
                        clearAlert={() => clearAlert?.()}
                        postMessage={(message) => {
                          sendMessage?.({} as any, message);
                          clearAlert?.();
                        }}
                      />
                    )}
                    {llmErrorAlert && <LlmErrorAlert alert={llmErrorAlert} clearAlert={() => clearLlmErrorAlert?.()} />}
                  </div>
                  {progressAnnotations && <ProgressCompilation data={progressAnnotations} />}
                  <ChatBox
                    zoukModel={zoukSelectedModel}
                    setZoukModel={setZoukSelectedModel}
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={setUploadedFiles}
                    imageDataList={imageDataList}
                    setImageDataList={setImageDataList}
                    textareaRef={textareaRef}
                    input={input}
                    handleInputChange={handleInputChange}
                    handlePaste={handlePaste}
                    TEXTAREA_MIN_HEIGHT={TEXTAREA_MIN_HEIGHT}
                    TEXTAREA_MAX_HEIGHT={TEXTAREA_MAX_HEIGHT}
                    isStreaming={isStreaming}
                    handleStop={handleStop}
                    handleSendMessage={handleSendMessage}
                    enhancingPrompt={enhancingPrompt}
                    enhancePrompt={enhancePrompt}
                    isListening={isListening}
                    startListening={startListening}
                    stopListening={stopListening}
                    chatStarted={chatStarted}
                    exportChat={exportChat}
                    qrModalOpen={qrModalOpen}
                    setQrModalOpen={setQrModalOpen}
                    handleFileUpload={handleFileUpload}
                    chatMode={chatMode}
                    setChatMode={setChatMode}
                    designScheme={designScheme}
                    setDesignScheme={setDesignScheme}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    onWebSearchResult={onWebSearchResult}
                  />
                </div>
              </StickToBottom>
            )}
            {!chatStarted && (
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '0 16px 40px',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {[
                  { emoji: '🎯', label: 'Create Ads', prompt: 'Create a multi-platform ad campaign for ' },
                  { emoji: '🌐', label: 'Build Website', prompt: 'Build a landing page website for ' },
                  { emoji: '⚙️', label: 'Automate Workflow', prompt: 'Automate the workflow that ' },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => {
                      if (handleInputChange) {
                        handleInputChange({ target: { value: chip.prompt } } as React.ChangeEvent<HTMLTextAreaElement>);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '14px 22px',
                      background: '#0b0b0b',
                      border: '1px solid #1c1c1c',
                      borderRadius: 14,
                      color: '#e0e0e0',
                      fontSize: 15,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'border-color .15s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#ec1d2e')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#1c1c1c')}
                  >
                    <span>{chip.emoji}</span>
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ClientOnly>
            {() => (
              <Workbench chatStarted={chatStarted} isStreaming={isStreaming} setSelectedElement={setSelectedElement} />
            )}
          </ClientOnly>
        </div>
      </div>
    );

    return <Tooltip.Provider delayDuration={200}>{baseChat}</Tooltip.Provider>;
  },
);

function ScrollToBottom() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    !isAtBottom && (
      <>
        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-zouk-elements-background-depth-1 to-transparent h-20 z-10" />
        <button
          className="sticky z-50 bottom-0 left-0 right-0 text-4xl rounded-lg px-1.5 py-0.5 flex items-center justify-center mx-auto gap-2 bg-zouk-elements-background-depth-2 border border-zouk-elements-borderColor text-zouk-elements-textPrimary text-sm"
          onClick={() => scrollToBottom()}
        >
          Go to last message
          <span className="i-ph:arrow-down animate-bounce" />
        </button>
      </>
    )
  );
}
