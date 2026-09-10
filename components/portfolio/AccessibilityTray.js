import * as Dialog from '@radix-ui/react-dialog';
import { Accessibility, X } from 'lucide-react';
import styles from '../../styles/AccessibilityTray.module.css';

export default function AccessibilityTray({ motion, onMotionChange }) {
  return <Dialog.Root>
    <Dialog.Trigger asChild><button className={styles.trigger} aria-label="Accessibility settings"><Accessibility size={22} aria-hidden="true" /></button></Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className={styles.overlay} />
      <Dialog.Content className={styles.tray}>
        <Dialog.Title className={styles.title}>Accessibility settings</Dialog.Title>
        <Dialog.Description className={styles.description}>Adjust motion in the project gallery.</Dialog.Description>
        <label className={styles.setting}><span>Animate project cards<small>Card swaps and pointer movement</small></span><input type="checkbox" checked={motion} onChange={event => onMotionChange(event.target.checked)} /></label>
        <Dialog.Close asChild><button className={styles.close} aria-label="Close accessibility settings"><X size={22} aria-hidden="true" /></button></Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
