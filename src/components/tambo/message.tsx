"use client";

import { markdownComponents } from "./markdown-components";
import {
  checkHasContent,
  getMessageImages,
  getSafeContent,
} from "@/lib/thread-hooks";
import { cn } from "@/lib/utils";
import type { TamboThreadMessage } from "@tambo-ai/react";
import { useTambo } from "@tambo-ai/react";
import type TamboAI from "@tambo-ai/typescript-sdk";
import { cva, type VariantProps } from "class-variance-authority";
import stringify from "json-stringify-pretty-compact";
import { Check, ChevronDown, ExternalLink, Loader2, X, Bot, User, Download } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { Streamdown } from "streamdown";
import html2canvas from "html2canvas-pro"; 
import jsPDF from "jspdf";

/**
 * Converts message content to markdown format for rendering with streamdown.
 */
function convertContentToMarkdown(
  content: TamboThreadMessage["content"] | React.ReactNode | undefined | null,
): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (React.isValidElement(content)) return "";
  if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const item of content) {
      if (item?.type === "text") {
        parts.push(item.text ?? "");
      } else if (item?.type === "resource") {
        const resource = item.resource;
        const uri = resource?.uri;
        if (uri) {
          const displayName = resource?.name ?? uri;
          const encodedUri = encodeURIComponent(uri);
          parts.push(`[${displayName}](tambo-resource://${encodedUri})`);
        }
      }
    }
    return parts.join(" ");
  }
  return "";
}

/**
 * CSS variants for the message container
 */
const messageVariants = cva("flex w-full mb-8 items-start gap-4 transition-all", {
  variants: {
    role: {
      user: "flex-row-reverse pl-4 md:pl-12",
      assistant: "flex-row pr-4 md:pr-12",
    },
    variant: {
      default: "",
      solid: "", 
    },
  },
  defaultVariants: {
    variant: "default",
    role: "assistant"
  },
});

/**
 * CSS variants for the Speech Bubble
 */
const bubbleVariants = cva(
  "relative max-w-full md:max-w-[85%] p-6 text-lg leading-relaxed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[-2px] overflow-hidden",
  {
    variants: {
      role: {
        user: "bg-white border-4 border-ink-black font-marker rounded-[2rem] rounded-tr-none text-ink-black rotate-1",
        assistant: "bg-newsprint border-2 border-ink-black font-body text-ink-black rounded-lg rounded-tl-none -rotate-1",
      },
    },
  }
);

interface MessageContextValue {
  role: "user" | "assistant";
  variant?: VariantProps<typeof messageVariants>["variant"];
  message: TamboThreadMessage;
  isLoading?: boolean;
}

const MessageContext = React.createContext<MessageContextValue | null>(null);

const useMessageContext = () => {
  const context = React.useContext(MessageContext);
  if (!context) {
    throw new Error("Message sub-components must be used within a Message");
  }
  return context;
};

export function getToolCallRequest(
  message: TamboThreadMessage,
): TamboAI.ToolCallRequest | undefined {
  return message.toolCallRequest ?? message.component?.toolCallRequest;
}

// --- Sub-Components ---

export interface MessageProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "content"
> {
  role: "user" | "assistant";
  message: TamboThreadMessage;
  variant?: VariantProps<typeof messageVariants>["variant"];
  isLoading?: boolean;
  children: React.ReactNode;
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  (
    { children, className, role, variant, isLoading, message, ...props },
    ref,
  ) => {
    const contextValue = React.useMemo(
      () => ({ role, variant, isLoading, message }),
      [role, variant, isLoading, message],
    );

    if (message.role === "tool") {
      return null;
    }

    return (
      <MessageContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(messageVariants({ role, variant }), className)}
          data-message-role={role}
          data-message-id={message.id}
          {...props}
        >
          {/* Avatar */}
          <div className={cn(
             "flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full border-2 border-ink-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10",
             role === "user" ? "bg-vintage-yellow ml-2" : "bg-vintage-blue mr-2"
          )}>
              {role === "user" ? <User size={20} /> : <Bot size={20} />}
          </div>

          {/* Bubble */}
          <div className={cn(bubbleVariants({ role }), "flex-1 min-w-0")}>
            {role === "user" && (
              <div className="absolute -right-[15px] top-[0px] w-0 h-0 border-t-[15px] border-t-ink-black border-r-[15px] border-r-transparent transform rotate-90" />
            )}
            {role === "assistant" && (
              <div className="absolute -left-[15px] top-[0px] w-0 h-0 border-t-[15px] border-t-ink-black border-l-[15px] border-l-transparent transform -rotate-90" />
            )}

            <div className="w-full">
              {children}
            </div>
          </div>
        </div>
      </MessageContext.Provider>
    );
  },
);
Message.displayName = "Message";

const LoadingIndicator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.1s]"></span>
    </div>
  );
};
LoadingIndicator.displayName = "LoadingIndicator";

function MessageContentRenderer({
  contentToRender,
  markdownContent,
  markdown,
}: {
  contentToRender: unknown;
  markdownContent: string;
  markdown: boolean;
}) {
  if (!contentToRender) {
    return <span className="opacity-50 italic">Empty message</span>;
  }
  if (React.isValidElement(contentToRender)) {
    return contentToRender;
  }
  if (markdown) {
    return (
      <Streamdown components={markdownComponents}>{markdownContent}</Streamdown>
    );
  }
  return markdownContent;
}

export type MessageImagesProps = React.HTMLAttributes<HTMLDivElement>;

const MessageImages = React.forwardRef<HTMLDivElement, MessageImagesProps>(
  ({ className, ...props }, ref) => {
    const { message } = useMessageContext();
    const images = getMessageImages(message.content);

    if (images.length === 0) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap gap-2 mb-2", className)}
        data-slot="message-images"
        {...props}
      >
        {images.map((imageUrl: string, index: number) => (
          <div
            key={index}
            className="w-32 h-32 rounded-md overflow-hidden shadow-sm border-2 border-ink-black"
          >
            <img
              src={imageUrl}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  },
);
MessageImages.displayName = "MessageImages";

export interface MessageContentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "content"
> {
  content?: string | TamboThreadMessage["content"];
  markdown?: boolean;
}

const MessageContent = React.forwardRef<HTMLDivElement, MessageContentProps>(
  (
    { className, children, content: contentProp, markdown = true, ...props },
    ref,
  ) => {
    const { message, isLoading } = useMessageContext();
    const contentToRender = children ?? contentProp ?? message.content;

    const markdownContent = React.useMemo(() => {
      const result = convertContentToMarkdown(contentToRender);
      return result;
    }, [contentToRender]);
    const hasContent = React.useMemo(
      () => checkHasContent(contentToRender),
      [contentToRender],
    );

    const showLoading = isLoading && !hasContent;

    return (
      <div
        ref={ref}
        className={cn(
          "relative block text-[15px] leading-relaxed transition-all duration-200 font-medium max-w-full bg-transparent p-0",
          className,
        )}
        data-slot="message-content"
        {...props}
      >
        {showLoading && !message.reasoning ? (
          <div
            className="flex items-center justify-start h-4 py-1"
            data-slot="message-loading-indicator"
          >
            <LoadingIndicator />
          </div>
        ) : (
          <div
            className={cn("break-words", !markdown && "whitespace-pre-wrap")}
            data-slot="message-content-text"
          >
            <MessageContentRenderer
              contentToRender={contentToRender}
              markdownContent={markdownContent}
              markdown={markdown}
            />
            {message.isCancelled && (
              <span className="text-muted-foreground text-xs">cancelled</span>
            )}
          </div>
        )}
      </div>
    );
  },
);
MessageContent.displayName = "MessageContent";

export interface ToolcallInfoProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "content"
> {
  markdown?: boolean;
}

function getToolStatusMessage(
  message: TamboThreadMessage,
  isLoading: boolean | undefined,
) {
  if (message.role !== "assistant" || !getToolCallRequest(message)) {
    return null;
  }

  const toolCallMessage = isLoading
    ? `Calling ${getToolCallRequest(message)?.toolName ?? "tool"}`
    : `Called ${getToolCallRequest(message)?.toolName ?? "tool"}`;
  const toolStatusMessage = isLoading
    ? message.component?.statusMessage
    : message.component?.completionStatusMessage;
  return toolStatusMessage ?? toolCallMessage;
}

function ToolcallStatusIcon({
  hasToolError,
  isLoading,
}: {
  hasToolError: boolean | undefined;
  isLoading: boolean | undefined;
}) {
  if (hasToolError) {
    return <X className="w-3 h-3 text-bold text-red-500" />;
  }
  if (isLoading) {
    return (
      <Loader2 className="w-3 h-3 text-muted-foreground text-bold animate-spin" />
    );
  }
  return <Check className="w-3 h-3 text-bold text-green-500" />;
}

const ToolcallInfo = React.forwardRef<HTMLDivElement, ToolcallInfoProps>(
  ({ className, markdown = true, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { message, isLoading } = useMessageContext();
    const { thread } = useTambo();
    const toolDetailsId = React.useId();

    const associatedToolResponse = React.useMemo(() => {
      if (!thread?.messages) return null;
      const currentMessageIndex = thread.messages.findIndex(
        (m: TamboThreadMessage) => m.id === message.id,
      );
      if (currentMessageIndex === -1) return null;
      for (let i = currentMessageIndex + 1; i < thread.messages.length; i++) {
        const nextMessage = thread.messages[i];
        if (nextMessage.role === "tool") {
          return nextMessage;
        }
        if (
          nextMessage.role === "assistant" &&
          getToolCallRequest(nextMessage)
        ) {
          break;
        }
      }
      return null;
    }, [message, thread?.messages]);

    if (message.role !== "assistant" || !getToolCallRequest(message)) {
      return null;
    }

    const toolCallRequest: TamboAI.ToolCallRequest | undefined =
      getToolCallRequest(message);
    const hasToolError = !!message.error;
    const toolStatusMessage = getToolStatusMessage(message, isLoading);

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-start text-xs opacity-70 mt-2",
          className,
        )}
        data-slot="toolcall-info"
        {...props}
      >
        <div className="flex flex-col w-full">
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={toolDetailsId}
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center gap-1 cursor-pointer hover:bg-black/5 rounded-md p-1 select-none w-fit border border-transparent hover:border-ink-black/20 transition-all",
            )}
          >
            <ToolcallStatusIcon
              hasToolError={hasToolError}
              isLoading={isLoading}
            />
            <span className="font-mono">{toolStatusMessage}</span>
            <ChevronDown
              className={cn(
                "w-3 h-3 transition-transform duration-200",
                !isExpanded && "-rotate-90",
              )}
            />
          </button>
          <div
            id={toolDetailsId}
            className={cn(
              "flex flex-col gap-1 p-3 pl-7 overflow-auto transition-[max-height,opacity,padding] duration-300 w-full truncate",
              isExpanded ? "max-h-auto opacity-100" : "max-h-0 opacity-0 p-0",
            )}
          >
            <span className="whitespace-pre-wrap pl-2 font-mono">
              tool: {toolCallRequest?.toolName}
            </span>
            <span className="whitespace-pre-wrap pl-2 font-mono">
              params:{"\n"}
              {stringify(keyifyParameters(toolCallRequest?.parameters))}
            </span>
            <SamplingSubThread parentMessageId={message.id} />
            {associatedToolResponse && (
              <div className="pl-2">
                <span className="whitespace-pre-wrap font-mono">result:</span>
                <div className="font-mono text-[10px]">
                  {!associatedToolResponse.content ? (
                    <span className="text-muted-foreground italic">
                      Empty response
                    </span>
                  ) : (
                    formatToolResult(associatedToolResponse.content, markdown)
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
ToolcallInfo.displayName = "ToolcallInfo";

const SamplingSubThread = ({
  parentMessageId,
  titleText = "finished additional work",
}: {
  parentMessageId: string;
  titleText?: string;
}) => {
  const { thread } = useTambo();
  const [isExpanded, setIsExpanded] = useState(false);
  const samplingDetailsId = React.useId();

  const childMessages = React.useMemo(() => {
    return thread?.messages?.filter(
      (m: TamboThreadMessage) => m.parentMessageId === parentMessageId,
    );
  }, [thread?.messages, parentMessageId]);

  if (!childMessages?.length) return null;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={samplingDetailsId}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-1 cursor-pointer hover:bg-muted-foreground/10 rounded-md p-2 select-none w-fit",
        )}
      >
        <span>{titleText}</span>
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform duration-200",
            !isExpanded && "-rotate-90",
          )}
        />
      </button>
      <div
        id={samplingDetailsId}
        className={cn(
          "transition-[max-height,opacity] duration-300",
          isExpanded
            ? "max-h-96 opacity-100 overflow-auto"
            : "max-h-0 opacity-0 overflow-hidden",
        )}
        aria-hidden={!isExpanded}
      >
        <div className="pl-2">
          <div className="border-l-2 border-muted-foreground p-2 flex flex-col gap-4">
            {childMessages?.map((m: TamboThreadMessage) => (
              <div key={m.id} className={`${m.role === "user" && "pl-2"}`}>
                <span
                  className={cn(
                    "whitespace-pre-wrap",
                    m.role === "assistant" &&
                      "bg-muted/50 rounded-md p-2 inline-block w-fit",
                  )}
                >
                  {getSafeContent(m.content)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
SamplingSubThread.displayName = "SamplingSubThread";

export type ReasoningInfoProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "content"
>;

const ReasoningInfo = React.forwardRef<HTMLDivElement, ReasoningInfoProps>(
  ({ className, ...props }, ref) => {
    const { message, isLoading } = useMessageContext();
    const reasoningDetailsId = React.useId();
    const [isExpanded, setIsExpanded] = useState(true);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (checkHasContent(message.content) && !isLoading) {
        setIsExpanded(false);
      }
    }, [message.content, isLoading]);

    React.useEffect(() => {
      if (scrollContainerRef.current && isExpanded && message.reasoning) {
        const scroll = () => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        };

        if (isLoading) {
          requestAnimationFrame(scroll);
        } else {
          const timeoutId = setTimeout(scroll, 50);
          return () => clearTimeout(timeoutId);
        }
      }
    }, [message.reasoning, isExpanded, isLoading]);

    if (!message.reasoning?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-start text-xs opacity-70 mb-2",
          className,
        )}
        data-slot="reasoning-info"
        {...props}
      >
        <div className="flex flex-col w-full">
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={reasoningDetailsId}
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center gap-1 cursor-pointer hover:bg-black/5 rounded-md px-3 py-1 select-none w-fit border border-ink-black/20",
            )}
          >
            <span className={isLoading ? "animate-pulse font-bold text-vintage-purple" : "font-mono"}>
              <ReasoningStatusText
                isLoading={isLoading}
                reasoningDurationMS={message.reasoningDurationMS}
                reasoningSteps={message.reasoning.length}
              />
            </span>
            <ChevronDown
              className={cn(
                "w-3 h-3 transition-transform duration-200",
                !isExpanded && "-rotate-90",
              )}
            />
          </button>
          <div
            ref={scrollContainerRef}
            id={reasoningDetailsId}
            className={cn(
              "flex flex-col gap-1 px-3 py-3 overflow-auto transition-[max-height,opacity,padding] duration-300 w-full",
              isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0 p-0",
            )}
          >
            {message.reasoning.map((reasoningStep, index) => (
              <div key={index} className="flex flex-col gap-1">
                {message.reasoning?.length && message.reasoning.length > 1 && (
                  <span className="text-muted-foreground text-xs font-medium">
                    Step {index + 1}:
                  </span>
                )}
                {reasoningStep ? (
                  <div className="bg-white/50 border border-ink-black/10 rounded-md p-3 text-xs overflow-x-auto overflow-y-auto max-w-full font-mono">
                    <div className="whitespace-pre-wrap break-words">
                      <Streamdown components={markdownComponents}>
                        {reasoningStep}
                      </Streamdown>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);
ReasoningInfo.displayName = "ReasoningInfo";

function keyifyParameters(parameters: TamboAI.ToolCallParameter[] | undefined) {
  if (!parameters) return;
  return Object.fromEntries(
    parameters.map((p) => [p.parameterName, p.parameterValue]),
  );
}

function ReasoningStatusText({
  isLoading,
  reasoningDurationMS,
  reasoningSteps,
}: {
  isLoading: boolean | undefined;
  reasoningDurationMS?: number;
  reasoningSteps: number;
}) {
  let statusText: string;
  if (isLoading) {
    statusText = "Thinking... ";
  } else if (reasoningDurationMS) {
    statusText = formatReasoningDuration(reasoningDurationMS) + " ";
  } else {
    statusText = "Thought complete ";
  }

  return (
    <>
      {statusText}
      {reasoningSteps > 1 ? `(${reasoningSteps} steps)` : ""}
    </>
  );
}

function formatReasoningDuration(durationMS: number) {
  const seconds = Math.floor(Math.max(0, durationMS) / 1000);
  if (seconds < 1) return "< 1s";
  return `${seconds}s`;
}

function renderImageContent(url: string, index: number): React.ReactNode {
  return (
    <div
      key={`image-${index}`}
      className="rounded-md overflow-hidden shadow-sm max-w-xs border border-ink-black"
    >
      <img
        src={url}
        alt={`Tool result image ${index + 1}`}
        loading="lazy"
        decoding="async"
        className="max-w-full h-auto object-contain"
      />
    </div>
  );
}

function renderResourceContent(
  resource: {
    uri?: string;
    text?: string;
    blob?: string;
    name?: string;
    mimeType?: string;
  },
  index: number,
): React.ReactNode {
  if (resource.blob && resource.mimeType?.startsWith("image/")) {
    const dataUrl = `data:${resource.mimeType};base64,${resource.blob}`;
    return (
      <div
        key={`resource-blob-${index}`}
        className="rounded-md overflow-hidden shadow-sm max-w-xs border border-ink-black"
      >
        <img
          src={dataUrl}
          alt={resource.name ?? `Resource image ${index + 1}`}
          loading="lazy"
          decoding="async"
          className="max-w-full h-auto object-contain"
        />
      </div>
    );
  }

  if (resource.text) {
    return (
      <div key={`resource-text-${index}`} className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-2 border border-ink-black/20">
        {resource.name && (
          <span className="font-bold text-ink-black">
            {resource.name}:{" "}
          </span>
        )}
        {resource.text}
      </div>
    );
  }

  if (resource.uri) {
    return (
      <div key={`resource-uri-${index}`} className="flex items-center gap-1 font-mono text-xs">
        <span className="font-bold text-ink-black">
          {resource.name ?? "Resource"}:
        </span>
        <span className="truncate">{resource.uri}</span>
      </div>
    );
  }

  return null;
}

function formatToolResult(
  content: TamboThreadMessage["content"],
  enableMarkdown = true,
): React.ReactNode {
  if (!content) return content;
  if (typeof content === "string") {
    return formatTextContent(content, enableMarkdown);
  }
  if (Array.isArray(content)) {
    const textParts: string[] = [];
    const nonTextParts: React.ReactNode[] = [];

    content.forEach((item, index) => {
      if (!item?.type) return;

      if (item.type === "text" && item.text) {
        textParts.push(item.text);
      } else if (item.type === "image_url" && item.image_url?.url) {
        nonTextParts.push(renderImageContent(item.image_url.url, index));
      } else if (item.type === "resource" && item.resource) {
        const resourceNode = renderResourceContent(item.resource, index);
        if (resourceNode) {
          nonTextParts.push(resourceNode);
        }
      }
    });

    const combinedText = textParts.join("");
    const textNode = combinedText
      ? formatTextContent(combinedText, enableMarkdown)
      : null;

    if (nonTextParts.length === 0) {
      return textNode;
    }

    return (
      <div className="flex flex-col gap-2">
        {textNode}
        {nonTextParts.length > 0 && (
          <div className="flex flex-wrap gap-2">{nonTextParts}</div>
        )}
      </div>
    );
  }
  return getSafeContent(content);
}

function formatTextContent(
  text: string,
  enableMarkdown: boolean,
): React.ReactNode {
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    return (
      <pre
        className={cn(
          "bg-gray-50 rounded-md p-3 text-xs overflow-x-auto overflow-y-auto max-w-full max-h-64 border border-ink-black/20",
        )}
      >
        <code className="font-mono break-words whitespace-pre-wrap">
          {JSON.stringify(parsed, null, 2)}
        </code>
      </pre>
    );
  } catch {
    if (!enableMarkdown) return text;
    return <Streamdown components={markdownComponents}>{text}</Streamdown>;
  }
}

export type MessageRenderedComponentAreaProps =
  React.HTMLAttributes<HTMLDivElement>;

const MessageRenderedComponentArea = React.forwardRef<
  HTMLDivElement,
  MessageRenderedComponentAreaProps
>(({ className, children, ...props }, ref) => {
  const { message, role } = useMessageContext();
  const { thread } = useTambo();
  const [canvasExists, setCanvasExists] = React.useState(false);
  
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Logic: Show the download button ONLY on the last AI message that has a component
  const isLastComponent = React.useMemo(() => {
      if (!thread?.messages) return false;
      const componentMessages = thread.messages.filter((m: TamboThreadMessage) => m.renderedComponent && !m.isCancelled && m.role === 'assistant');
      if (componentMessages.length === 0) return false;
      const lastMsg = componentMessages[componentMessages.length - 1];
      return lastMsg?.id === message.id;
  }, [thread?.messages, message.id]);

  React.useEffect(() => {
    const checkCanvasExists = () => {
      const canvas = document.querySelector('[data-canvas-space="true"]');
      setCanvasExists(!!canvas);
    };
    checkCanvasExists();
    window.addEventListener("resize", checkCanvasExists);
    return () => {
      window.removeEventListener("resize", checkCanvasExists);
    };
  }, []);

  const handleDownloadAllPDF = async () => {
    setIsDownloading(true);

    try {
      // Find all report parts in the entire chat history
      const allReportPages = document.querySelectorAll(".tambo-report-part");
      
      if (allReportPages.length === 0) {
        alert("No report pages found to download.");
        setIsDownloading(false);
        return;
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });

      const padding = 20; 
      const pageWidth = pdf.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (padding * 2);

      for (let i = 0; i < allReportPages.length; i++) {
        const pageElement = allReportPages[i] as HTMLElement;
        
        // Capture element with high resolution
        // FIX: Cast options to any to avoid strict type error on 'scale'
        const canvas = await html2canvas(pageElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
        } as any);

        const imgData = canvas.toDataURL("image/png");
        
        // FIX: Calculate aspect ratio manually without getImageProperties
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const pdfImgHeight = (imgHeight * contentWidth) / imgWidth;

        // Add new page for each component (except the first one)
        if (i > 0) {
            pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", padding, padding, contentWidth, pdfImgHeight);
      }
      
      pdf.save(`data-magazine-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (
    !message.renderedComponent ||
    role !== "assistant" ||
    message.isCancelled
  ) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(className)}
      data-slot="message-rendered-component-area"
      {...props}
    >
      {children ??
        (canvasExists ? (
          <div className="flex justify-start pl-4 mt-2">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("tambo:showComponent", {
                      detail: {
                        messageId: message.id,
                        component: message.renderedComponent,
                      },
                    }),
                  );
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer group font-mono border border-ink-black/30 px-2 py-1 rounded hover:bg-black/5"
            >
              View component
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-full pt-4 relative group/download">
            
            {/* WRAPPER FOR PDF CAPTURE */}
            <div ref={contentRef} className="bg-white rounded-md tambo-report-part mb-4 overflow-hidden"> 
               {message.renderedComponent}
            </div>

            {/* DOWNLOAD BUTTON (Only on last component) */}
            {isLastComponent && (
                <div className="w-full flex justify-center pb-4 mt-8">
                    <button 
                        onClick={handleDownloadAllPDF}
                        disabled={isDownloading}
                        className="flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-lg text-sm font-bold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 hover:bg-[#e63946]"
                        title="Download Full Magazine (All Pages)"
                    >
                        {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                        <Download className="w-4 h-4" />
                        )}
                        {isDownloading ? "Compiling PDF..." : "DOWNLOAD FULL ISSUE"}
                    </button>
                </div>
            )}
          </div>
        ))}
    </div>
  );
});
MessageRenderedComponentArea.displayName = "Message.RenderedComponentArea";

// --- Exports ---
export {
  LoadingIndicator,
  Message,
  MessageContent,
  MessageImages,
  MessageRenderedComponentArea,
  messageVariants,
  ReasoningInfo,
  ToolcallInfo,
};