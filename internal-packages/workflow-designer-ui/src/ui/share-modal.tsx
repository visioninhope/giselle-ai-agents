import { useState } from "react";
import { Button } from "./button";
import { Dialog, RadioGroup } from "radix-ui";
import clsx from "clsx";
import { CheckIcon, CopyIcon } from "lucide-react";

type SharePermission = "edit" | "view";

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
  const [copied, setCopied] = useState(false);

  // この関数は実際の実装では、APIを呼び出してトークンを取得する
  const generateShareUrl = (permission: SharePermission) => {
    // ダミーURL - 実際の実装ではバックエンドAPIからJWTトークンを取得する
    return `${window.location.origin}/playground/${appId}?permission=${permission}&token=dummy-token-for-ui-only`;
  };

  const handleCopy = async () => {
    const url = generateShareUrl(permission);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black-900/40 data-[state=open]:animate-overlayShow" />
        <Dialog.Content
          className={clsx(
            "fixed left-1/2 top-1/2 max-w-[450px] w-[90vw] -translate-x-1/2 -translate-y-1/2",
            "rounded-[12px] bg-black-850 p-[24px] border-[0.5px] border-black-400 shadow-black-300 focus:outline-none",
          )}
        >
          <Dialog.Title className="m-0 text-[18px] font-medium text-white-900 mb-4">
            シェアする
          </Dialog.Title>
          
          <div className="mb-6">
            <p className="text-[14px] text-white-800 mb-4">
              このAppへのリンクを作成して共有します。アクセス権限を選択してください：
            </p>
            
            <RadioGroup.Root
              value={permission}
              onValueChange={(value) => setPermission(value as SharePermission)}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center">
                <RadioGroup.Item
                  value="edit"
                  id="r1"
                  className="w-[20px] h-[20px] rounded-full border border-primary-700 mr-2 flex items-center justify-center"
                >
                  <RadioGroup.Indicator className="w-[10px] h-[10px] rounded-full bg-primary-700" />
                </RadioGroup.Item>
                <label htmlFor="r1" className="text-[14px] text-white-900">
                  編集可能 - 共有相手は内容を変更できます
                </label>
              </div>
              
              <div className="flex items-center">
                <RadioGroup.Item
                  value="view"
                  id="r2"
                  className="w-[20px] h-[20px] rounded-full border border-primary-700 mr-2 flex items-center justify-center"
                >
                  <RadioGroup.Indicator className="w-[10px] h-[10px] rounded-full bg-primary-700" />
                </RadioGroup.Item>
                <label htmlFor="r2" className="text-[14px] text-white-900">
                  閲覧のみ - 共有相手はプレビューのみ可能です
                </label>
              </div>
            </RadioGroup.Root>
          </div>
          
          <div className="bg-black-800 rounded-md p-2 flex mb-5">
            <input
              type="text"
              value={generateShareUrl(permission)}
              readOnly
              className="flex-1 bg-transparent text-white-900 text-sm border-none outline-none"
            />
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="min-w-[80px]"
            >
              {copied ? (
                <>
                  <CheckIcon size={16} />
                  コピー済み
                </>
              ) : (
                <>
                  <CopyIcon size={16} />
                  コピー
                </>
              )}
            </Button>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCopy}>
              {copied ? "コピー済み" : "リンクをコピー"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 