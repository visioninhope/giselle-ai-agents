import { useState } from "react";
import { Button } from "./button";
import { Dialog, RadioGroup } from "radix-ui";
import clsx from "clsx";
import { CheckIcon, CopyIcon, ChevronDownIcon, XIcon } from "lucide-react";

type SharePermission = "edit" | "view";
type AccessScope = "team" | "anyone";

export function ShareModal({
  open,
  onOpenChange,
  appId = "example-app-123",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId?: string;
}) {
  const [permission, setPermission] = useState<SharePermission>("view");
  const [accessScope, setAccessScope] = useState<AccessScope>("team");
  const [copied, setCopied] = useState(false);

  // This function would call an API to get a token in a real implementation
  const generateShareUrl = () => {
    // Dummy URL - in real implementation this would fetch a JWT token from backend
    return `http://localhost:3000/playground/wrks-WdQ7...`;
  };

  const handleCopy = async () => {
    const url = generateShareUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScopeDescription = () => {
    if (accessScope === "team") {
      return "Only team members and invited guests can access this app.";
    } else {
      return "Anyone with the URL can access this app, not just team members or individually invited users.";
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 bg-black-900/20 backdrop-blur-[2px] data-[state=open]:animate-overlayShow z-50" 
        />
        <Dialog.Content
          className={clsx(
            "fixed left-1/2 top-1/2 max-w-[520px] w-[90vw] -translate-x-1/2 -translate-y-1/2 z-50",
            "rounded-[16px] bg-[#0C0F1F] p-[32px] border border-[#1C2033] shadow-xl focus:outline-none",
            "transform transition-all duration-300 ease-out data-[state=open]:animate-contentShow",
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title 
              style={{
                color: 'var(--primary100, #B8E8F4)',
                textShadow: '0px 0px 10px #0087F6',
                fontFamily: '"Hubot Sans"',
                fontSize: '24px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: '140%'
              }}
            >
              Share this App
            </Dialog.Title>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCopy}
                style={{
                  color: 'var(--primary100, #B8E8F4)',
                  fontFamily: '"Hubot Sans"',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  lineHeight: '140%',
                  textDecorationLine: 'underline',
                  textDecorationStyle: 'solid',
                  textDecorationSkipInk: 'none',
                  textDecorationThickness: 'auto',
                  textUnderlineOffset: 'auto',
                  textUnderlinePosition: 'from-font'
                }}
              >
                Copy link
              </button>
              <Dialog.Close asChild>
                <button
                  className="rounded-full h-8 w-8 inline-flex items-center justify-center text-white-400 hover:text-white-900 focus:outline-none transition-colors"
                  aria-label="Close"
                >
                  <XIcon size={18} />
                </button>
              </Dialog.Close>
            </div>
          </div>
          
          <p className="text-[15px] text-white-400 mb-8">
            Create a link to share this app with others. Choose the access level:
          </p>
          
          <div className="mb-5">
            <h3 
              style={{
                color: 'var(--white-850, #F5F5F5)',
                fontFamily: 'Geist',
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '170%'
              }}
              className="mb-3"
            >
              Access authorizations
            </h3>
            
            <div className="relative mb-2">
              <button 
                style={{
                  display: 'flex',
                  height: '36px',
                  padding: '8px 16px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  alignSelf: 'stretch',
                  borderRadius: '8px',
                  border: '1px solid var(--white-900, #F7F9FD)',
                  boxShadow: '0px 0px 4px 0px rgba(255, 255, 255, 0.20) inset'
                }}
                onClick={() => setAccessScope(accessScope === "team" ? "anyone" : "team")}
                className="w-full"
              >
                <span style={{
                  color: 'var(--white-900, #F7F9FD)',
                  fontFamily: '"Hubot Sans"',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '140%'
                }}>
                  {accessScope === "team" ? "Only people in your team" : "Anyone"}
                </span>
                <ChevronDownIcon size={18} style={{ color: 'var(--white-900, #F7F9FD)' }} />
              </button>
            </div>
            
            <p className="text-[14px] text-[#5C6484] mb-6">
              {getScopeDescription()}
            </p>
          </div>
          
          {accessScope === "anyone" && (
            <>
              <h3 
                style={{
                  color: 'var(--white-850, #F5F5F5)',
                  fontFamily: 'Geist',
                  fontSize: '12px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '170%'
                }}
                className="mb-3"
              >
                What can they do:
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={clsx(
                  "rounded-lg p-4 border border-[#1C2033] cursor-pointer",
                  permission === "edit" ? "bg-[#10121E]" : "bg-[#0A0C1A]"
                )}
                onClick={() => setPermission("edit")}
                >
                  <div className="flex items-start mb-3">
                    <div className={clsx(
                      "w-5 h-5 rounded-full border flex items-center justify-center mr-2 mt-0.5",
                      permission === "edit" 
                        ? "border-[#9AABD0]" 
                        : "border-[#3A3F59]"
                    )}>
                      {permission === "edit" && <div className="w-2.5 h-2.5 rounded-full bg-[#9AABD0]" />}
                    </div>
                    <div>
                      <div className="text-white-900 font-medium">Editor access</div>
                    </div>
                  </div>
                  <p className="text-[#5C6484] text-[14px] ml-7">
                    Only people in your team can access
                  </p>
                </div>
                
                <div className={clsx(
                  "rounded-lg p-4 border border-[#1C2033] cursor-pointer",
                  permission === "view" ? "bg-[#10121E]" : "bg-[#0A0C1A]"
                )}
                onClick={() => setPermission("view")}
                >
                  <div className="flex items-start mb-3">
                    <div className={clsx(
                      "w-5 h-5 rounded-full border flex items-center justify-center mr-2 mt-0.5",
                      permission === "view" 
                        ? "border-[#9AABD0]" 
                        : "border-[#3A3F59]"
                    )}>
                      {permission === "view" && <div className="w-2.5 h-2.5 rounded-full bg-[#9AABD0]" />}
                    </div>
                    <div>
                      <div className="text-white-900 font-medium">Viewer access</div>
                    </div>
                  </div>
                  <p className="text-[#5C6484] text-[14px] ml-7">
                    Collaborators can only preview the app
                  </p>
                </div>
              </div>
            </>
          )}
          
          {accessScope === "team" && (
            <>
              <h3 
                style={{
                  color: 'var(--white-850, #F5F5F5)',
                  fontFamily: 'Geist',
                  fontSize: '12px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '170%'
                }}
                className="mb-3"
              >
                Who can access
              </h3>
              
              <div 
                style={{
                  display: 'flex',
                  padding: '8px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  alignSelf: 'stretch',
                  borderRadius: '8px',
                  background: 'var(--white-900-10, rgba(247, 249, 253, 0.10))'
                }}
                className="mb-4"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-300 rounded-full mr-3"></div>
                  <span style={{
                    color: 'var(--white-850, #F5F5F5)',
                    fontFamily: 'Geist',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '170%'
                  }}>Your team</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[#5C6484] mr-2">edit</span>
                  <ChevronDownIcon size={16} className="text-[#5C6484]" />
                </div>
              </div>
              
              <div 
                style={{
                  display: 'flex',
                  padding: '8px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  alignSelf: 'stretch',
                  borderRadius: '8px',
                  background: 'var(--white-900-10, rgba(247, 249, 253, 0.10))'
                }}
                className="mb-6"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-300 rounded-full mr-3"></div>
                  <span style={{
                    color: 'var(--white-850, #F5F5F5)',
                    fontFamily: 'Geist',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '170%'
                  }}>kaori.nakashima@route06.co.jp</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[#5C6484] mr-2">view</span>
                  <ChevronDownIcon size={16} className="text-[#5C6484]" />
                </div>
              </div>
            </>
          )}
          
          <div 
            style={{
              display: 'flex',
              padding: '8px 12px',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              alignSelf: 'stretch',
              borderRadius: '8px',
              background: 'var(--black-800, #1D2551)'
            }}
            className="mb-4"
          >
            <input
              type="text"
              value={generateShareUrl()}
              readOnly
              style={{
                display: 'block',
                flex: '1 0 0',
                overflow: 'hidden',
                color: '#FFF',
                textOverflow: 'ellipsis',
                fontFamily: 'Geist',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal',
                whiteSpace: 'nowrap',
                minWidth: 0
              }}
              className="bg-transparent border-none outline-none"
            />
            <button
              onClick={handleCopy}
              className="text-white-900 p-1.5 rounded hover:bg-[#151A3A] transition-colors flex-shrink-0"
            >
              <CopyIcon size={16} />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 