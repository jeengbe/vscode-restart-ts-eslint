'use strict';
import * as vscode from 'vscode';

let restartTsEslintBoth: vscode.StatusBarItem;

const TYPESCRIPT_EXTENSION_ID = 'vscode.typescript-language-features';
const ESLINT_EXTENSION_ID = 'dbaeumer.vscode-eslint';

const RESTART_BOTH_LABEL = '$(debug-restart) Restart TS And ESLint Server';
const THIS_EXT_NAME = 'restart-ts-eslint-server';
const THIS_EXT_ID = `jeengbe.${THIS_EXT_NAME}`;
const SUPPORTED_LANGUAGES = [
  'javascript',
  'javascriptreact',
  'typescript',
  'typescriptreact',
  'svelte',
];

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${THIS_EXT_NAME}.softRestartBoth`,
      softRestartBoth,
    ),
  );

  restartTsEslintBoth = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    0,
  );
  restartTsEslintBoth.command = `${THIS_EXT_NAME}.softRestartBoth`;
  restartTsEslintBoth.text = RESTART_BOTH_LABEL;

  const restartBothCommandPalette = vscode.commands.registerCommand(
    `${THIS_EXT_NAME}.softRestartBothCommand`,
    softRestartBoth,
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBarItemVisibility),
  );
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(updateStatusBarItemVisibility),
  );
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument(updateStatusBarItemVisibility),
  );
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(updateStatusBarItemVisibility),
  );
  context.subscriptions.push(restartBothCommandPalette);

  updateStatusBarItemVisibility();
  console.log(`Extension ${THIS_EXT_ID} is now active!`);
}

function softRestartEslintServer() {
  if (!vscode.extensions.getExtension(ESLINT_EXTENSION_ID)?.isActive) {
    vscode.window.showErrorMessage(
      'ESLint extension is not active or not running.',
    );
    return;
  }

  return vscode.commands.executeCommand('eslint.restart');
}

async function softRestartTsServer() {
  if (!vscode.extensions.getExtension(TYPESCRIPT_EXTENSION_ID)?.isActive) {
    vscode.window.showErrorMessage(
      'TypeScript extension is not active or not running.',
    );
    return;
  }

  await vscode.commands.executeCommand('typescript.restartTsServer');
}

async function softRestartBoth() {
  await softRestartTsServer();
  await softRestartEslintServer();
}

function updateStatusBarItemVisibility(): void {
  const { activeTextEditor } = vscode.window;

  if (
    !activeTextEditor?.document ||
    !SUPPORTED_LANGUAGES.includes(activeTextEditor.document.languageId)
  ) {
    restartTsEslintBoth.hide();
  } else {
    if (vscode.extensions.getExtension(ESLINT_EXTENSION_ID)?.isActive) {
      restartTsEslintBoth.show();
    }
  }
}

export function deactivate() {
  console.log(`Extension ${THIS_EXT_ID} is now inactive!`);
}
