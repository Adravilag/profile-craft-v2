import React from 'react';
import ModalShell from '@/components/ui/Modal/ModalShell';

type ModalPayload = {
  id: string;
  content: React.ReactNode;
  props?: Record<string, any>;
};

type ModalContextValue = {
  openModal: (id: string, content: React.ReactNode, props?: Record<string, any>) => void;
  closeModal: (id?: string) => void;
  activeModal: ModalPayload | null;
};

const ModalContext = React.createContext<ModalContextValue | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModal, setActiveModal] = React.useState<ModalPayload | null>(null);

  const openModal = React.useCallback(
    (id: string, content: React.ReactNode, props?: Record<string, any>) => {
      // Debug
      // eslint-disable-next-line no-console
      console.debug('[ModalContext] openModal request', { id });

      // If content is a React element, clone it with a unique key to force React to remount
      let finalContent = content;
      try {
        if (React.isValidElement(content)) {
          finalContent = React.cloneElement(
            content as React.ReactElement<any>,
            { key: `modal-${Date.now()}` } as any
          );
        }
      } catch (err) {
        // noop
      }

      setActiveModal({ id, content: finalContent, props });
      try {
        document.body.classList.add('modal-open');
      } catch (err) {
        /* noop */
      }
      try {
        document.documentElement.setAttribute('data-modal', id);
      } catch (err) {
        /* noop */
      }
      // eslint-disable-next-line no-console
      console.debug('[ModalContext] openModal mounted', {
        id,
        bodyClass:
          typeof document !== 'undefined'
            ? document.body.classList.contains('modal-open')
            : undefined,
        dataModal:
          typeof document !== 'undefined'
            ? document.documentElement.getAttribute('data-modal')
            : undefined,
      });
    },
    []
  );

  const closeModal = React.useCallback((id?: string) => {
    // Debug
    // eslint-disable-next-line no-console
    console.debug('[ModalContext] closeModal request', { id });

    setActiveModal(current => {
      if (!current) return null;
      if (!id || current.id === id) {
        try {
          document.body.classList.remove('modal-open');
        } catch (err) {
          /* noop */
        }
        try {
          document.documentElement.removeAttribute('data-modal');
        } catch (err) {
          /* noop */
        }
        // eslint-disable-next-line no-console
        console.debug('[ModalContext] closeModal removed class', {
          bodyClass: document.body.classList.contains('modal-open'),
          dataModal: document.documentElement.getAttribute('data-modal'),
        });
        return null;
      }
      return current;
    });
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal, activeModal }}>
      {children}
      <ModalHost modal={activeModal} onClose={() => closeModal()} />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = React.useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};

const ModalHost: React.FC<{ modal: ModalPayload | null; onClose: () => void }> = ({
  modal,
  onClose,
}) => {
  // Delegate rendering to the generic ModalShell (carcasa) for all modal content
  if (!modal) return null;

  // Debug: ayudar a diagnosticar en tiempo de ejecución (ver consola del navegador)
  // Muestra el id del modal y el tipo de contenido recibido.
  // eslint-disable-next-line no-console
  console.debug(
    '[ModalHost] mounting modal:',
    modal.id,
    'contentType=',
    (modal.content && (modal.content as any)?.type?.name) || typeof modal.content
  );

  // If the content is already a ModalShell, clone it to ensure onClose is wired.
  if (React.isValidElement(modal.content) && modal.content.type === ModalShell) {
    const element = modal.content as React.ReactElement<any>;
    const existingOnClose: (() => void) | undefined = element.props?.onClose;
    return React.cloneElement(element, { onClose: existingOnClose ?? onClose } as any);
  }

  return (
    <ModalShell title={(modal.props && modal.props.title) || undefined} onClose={onClose}>
      {modal.content}
    </ModalShell>
  );
};

export default ModalContext;
