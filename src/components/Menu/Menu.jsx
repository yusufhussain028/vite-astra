import * as React from "react";
import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
} from "@fluentui/react-components";
import {
  bundleIcon,
  ClipboardPasteRegular,
  ClipboardPasteFilled,
  CutRegular,
  CutFilled,
  CopyRegular,
  CopyFilled,
} from "@fluentui/react-icons";

const PasteIcon = bundleIcon(ClipboardPasteFilled, ClipboardPasteRegular);
const CopyIcon = bundleIcon(CopyFilled, CopyRegular);
const CutIcon = bundleIcon(CutFilled, CutRegular);

export const Interaction = (props) => {
  return (
    <Menu {...props}>
      <MenuTrigger disableButtonEnhancement>
        <Button>Edit content</Button>
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          <MenuItem
            icon={<CutIcon />}
            onClick={() => alert("Cut to clipboard")}
          >
            Cut
          </MenuItem>
          <MenuItem
            icon={<CopyIcon />}
            onClick={() => alert("Copied to clipboard")}
          >
            Copy
          </MenuItem>
          <MenuItem
            icon={<PasteIcon />}
            onClick={() => alert("Pasted from clipboard")}
          >
            Paste
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};