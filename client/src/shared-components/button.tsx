import classes from './button.module.less';

export enum ButtonStyle {
  Primary = 'Primary',
  Secondary = 'Secondary',
}

interface Props {
  buttonStyle: ButtonStyle;
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

function mapButtonStyleToClassName(buttonStyle: ButtonStyle): string {
  switch (buttonStyle) {
    case ButtonStyle.Primary:
    default:
      return classes.primaryButton;
    case ButtonStyle.Secondary:
      return classes.secondaryButton;
  }
}
export function Button(props: Props) {
  const { buttonStyle, onClick, children } = props;
  return (
    <button className={mapButtonStyleToClassName(buttonStyle)} onClick={onClick}>
      {children}
    </button>
  );
}
