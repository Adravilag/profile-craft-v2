import React from 'react';

type Props = { value?: string; onChange?: (v: string) => void };
export default function LexicalEditorNew(_props: Props) {
  return <div data-testid="lexical-editor" />;
}
