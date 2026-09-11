import * as Dialog from '@radix-ui/react-dialog';
import { PersonStanding, X } from 'lucide-react';
import styles from '../../styles/AccessibilityTray.module.css';

export default function AccessibilityTray({ motionMode, onMotionChange }) {
  return <Dialog.Root>
    <Dialog.Trigger asChild><button className={styles.trigger} aria-label="Accessibility settings"><PersonStanding size={24} strokeWidth={1.8} aria-hidden="true" /></button></Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className={styles.overlay} />
      <Dialog.Content className={styles.tray}>
        <Dialog.Title className={styles.title}>Accessibility settings</Dialog.Title>
        <Dialog.Description className={styles.description}>Adjust decorative motion throughout the page.</Dialog.Description>
        <label className={styles.setting}><span>Motion preference<small>System follows your device. Full motion overrides reduced motion for this site.</small></span><select aria-label="Motion preference" value={motionMode} onChange={event=>onMotionChange(event.target.value)} style={{background:'#14201c',color:'#edf1ee',padding:8,border:'1px solid #77897f',borderRadius:8}}><option value="system">System</option><option value="full">Full motion</option><option value="reduced">Reduced motion</option></select></label>
        <Dialog.Close asChild><button className={styles.close} aria-label="Close accessibility settings"><X size={22} aria-hidden="true" /></button></Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
