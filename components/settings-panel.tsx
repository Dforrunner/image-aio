"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings2, Zap, Info } from "lucide-react";
import type { ProcessingSettings, OutputFormat } from "@/types/image";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  settings: ProcessingSettings;
  onSettingsChange: (settings: ProcessingSettings) => void;
  onProcess: () => void;
  isProcessing: boolean;
  hasFiles: boolean;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  onProcess,
  isProcessing,
  hasFiles,
}: SettingsPanelProps) {
  const formats: Array<{
    value: OutputFormat;
    label: string;
    description: string;
  }> = [
    { value: "webp", label: "WebP", description: "Best compression" },
    { value: "avif", label: "AVIF", description: "Next-gen format" },
    { value: "jpeg", label: "JPEG", description: "Universal" },
    { value: "png", label: "PNG", description: "Lossless" },
    { value: "tiff", label: "TIFF", description: "Professional" },
    { value: "gif", label: "GIF", description: "Animated" },
  ];

  const handleFormatChange = (format: OutputFormat) => {
    onSettingsChange({ ...settings, format });
  };

  const handleQualityChange = (value: number[]) => {
    onSettingsChange({ ...settings, quality: value[0] });
  };

   const handleResizeChange = (dimension: "width" | "height", value: string) => {
    const numValue = value === "" ? undefined : Number.parseInt(value)
    onSettingsChange({
      ...settings,
      resize: {
        ...settings.resize,
        [dimension]: numValue,
        mode: settings.resize?.mode || "both",
      },
    })
  }

  const handleResizeModeChange = (mode: "maxWidth" | "maxHeight" | "both") => {
    onSettingsChange({
      ...settings,
      resize: {
        ...settings.resize,
        mode,
      },
    })
  }
  const clearResize = () => {
    onSettingsChange({
      ...settings,
      resize: undefined,
    });
  };

  const handleMetadataToggle = (checked: boolean) => {
    onSettingsChange({ ...settings, preserveMetadata: checked });
  };

  const handleLosslessToggle = (checked: boolean) => {
    onSettingsChange({ ...settings, lossless: checked });
  };

  const handleEffortChange = (value: number[]) => {
    onSettingsChange({ ...settings, effort: value[0] });
  };

  return (
    <div className="sticky top-1 p-3 space-y-3 border border-dashed rounded-2xl">
      <div className="flex items-center gap-2 border-b border-border">
        <Settings2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Processing Settings
        </h3>
      </div>

      {/* Format Selection */}
      <div className="space-y-1 ">
        <Label className="text-sm font-medium text-foreground pb-2">
          Output Format
        </Label>
        <div className="grid grid-cols-3 gap-2 border-b pb-3">
          {formats.map((format) => (
            <button
              key={format.value}
              onClick={() => handleFormatChange(format.value)}
              className={cn(
                "relative rounded-lg border-2 p-2 text-xs text-center transition-all duration-200",
                settings.format === format.value
                  ? "border-primary bg-primary/10 text-primary scale-105"
                  : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50 hover:bg-secondary"
              )}
            >
              <div className="text-xs font-bold uppercase">{format.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {format.description}
              </div>
              {settings.format === format.value && (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-in zoom-in duration-200" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">Quality</Label>
          <span className="text-sm font-bold text-primary">
            {settings.quality}%
          </span>
        </div>
        <Slider
          value={[settings.quality]}
          onValueChange={handleQualityChange}
          min={1}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Smaller size</span>
          <span>Better quality</span>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-border">
        <Label className="text-sm font-medium text-foreground">
          Advanced Options
        </Label>

        {/* Lossless Toggle */}
        {(settings.format === "webp" || settings.format === "avif") && (
          <div className="flex items-center justify-between">
            <div >
              <Label className="text-sm text-foreground">Lossless Mode</Label>
              <p className="text-xs text-muted-foreground">
                Maximum quality, larger files
              </p>
            </div>
            <Switch
              checked={settings.lossless || false}
              onCheckedChange={handleLosslessToggle}
            />
          </div>
        )}

        {/* Metadata Preservation */}
        <div className="flex items-center justify-between">
          <div >
            <Label className="text-sm text-foreground">Preserve Metadata</Label>
            <p className="text-xs text-muted-foreground">
              Keep EXIF, ICC profiles
            </p>
          </div>
          <Switch
            checked={settings.preserveMetadata || false}
            onCheckedChange={handleMetadataToggle}
          />
        </div>

        {/* Compression Effort */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-foreground">
              Compression Effort
            </Label>
            <span className="text-xs font-bold text-primary">
              {settings.effort || 4}/6
            </span>
          </div>
          <Slider
            value={[settings.effort || 4]}
            onValueChange={handleEffortChange}
            min={0}
            max={6}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Faster</span>
            <span>Better compression</span>
          </div>
        </div>
      </div>

      {/* Resize Options */}
      <div className="space-y-1 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">
            Resize (Optional)
          </Label>
          {settings.resize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearResize}
              className="h-6 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
            <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Constraint Mode</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "maxWidth" as const, label: "Max Width" },
                { value: "maxHeight" as const, label: "Max Height" },
                { value: "both" as const, label: "Both" },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => handleResizeModeChange(mode.value)}
                  className={cn(
                    "relative rounded-md border px-2 py-1.5 text-xs font-medium transition-all duration-200",
                    settings.resize?.mode === mode.value || (!settings.resize?.mode && mode.value === "both")
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Width (px)</Label>
            <Input
              type="number"
              placeholder="Auto"
              value={settings.resize?.width || ""}
              onChange={(e) => handleResizeChange("width", e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Height (px)</Label>
            <Input
              type="number"
              placeholder="Auto"
              value={settings.resize?.height || ""}
              onChange={(e) => handleResizeChange("height", e.target.value)}
              className="h-9"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Only resizes images larger than specified dimensions</p>
      </div>

      {/* Process Button */}
      <Button
        onClick={onProcess}
        disabled={!hasFiles || isProcessing}
        size="lg"
        className="w-full gap-2 font-semibold"
      >
        {isProcessing ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Processing...
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            Process Images
          </>
        )}
      </Button>

      <Card className="p-2 bg-primary/5 border-primary/20">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Format Support
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Supports JPEG, PNG, WebP, AVIF, TIFF, GIF, SVG, and HEIF input
              formats. Max file size: 50MB per image.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
