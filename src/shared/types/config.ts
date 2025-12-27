export interface KeybindingsConfig {
  leader: string;
  timeout: number;
  bindings: Record<string, string>;
}

export interface PreviewerConfig {
  offset: number;
}

export interface AppConfig {
  root_dir: string | null;
  template_phantom_node: string | null;
  previewer: PreviewerConfig;
  keybindings?: KeybindingsConfig;
}
