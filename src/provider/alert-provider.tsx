import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import { AlertComponent } from '../components/AlertComponent';
type cb = (ok: boolean) => void;

type ContextType = {
  show: (title: string, text: string, cancelBtn?: boolean, cb?: cb) => void;
};

const AlertContext = createContext<ContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('Please wrap this component in AlertProvider');
  }

  return ctx;
};

export const AlertProvider = ({ children }: Props) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);
  const [canCancel, setCancel] = useState(false);
  // const [callback, setCallback] = useState<cb | undefined>(undefined);

  const visibleRef = useRef(visible);
  const canCancelRef = useRef(canCancel);
  const callbackRef = useRef<cb | null>(null);

  const show = useCallback(
    (
      title: string,
      text: string,
      cancelBtn: boolean = false,
      cb?: (ok: boolean) => void
    ) => {
      if (visibleRef.current) {
        callbackRef.current?.(canCancelRef.current ? false : true); // call old callback
      }

      setTitle(title);
      setText(text);
      setCancel(cancelBtn);
      setVisible(true);

      canCancelRef.current = cancelBtn;
      visibleRef.current = true;
      callbackRef.current = cb ?? null;
    },
    []
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <AlertContext.Provider
      value={value}
    >
      {children}
      <AlertComponent
        title={title}
        text={text}
        visible={visible}
        cancelBtn={canCancel}
        onClose={ok => {
          callbackRef.current?.(ok);
          callbackRef.current = null;

          setVisible(false);
          visibleRef.current = false;
        }}
      />
    </AlertContext.Provider>
  );
};
