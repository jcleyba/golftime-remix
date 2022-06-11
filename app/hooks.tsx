import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { IoSearch } from "react-icons/io5";

interface SearchBarProps {
  variant?: "filled" | "outline";
}

export function useSearchBar<P>(
  list: P[],
  predicate: (e: React.ChangeEvent<HTMLInputElement>) => (item: P) => boolean,
  initialize?: boolean
): [(props: SearchBarProps) => JSX.Element, P[], () => void] {
  const [data, setData] = useState<P[]>(initialize ? list : []);
  const [value, setValue] = useState("");

  const filter = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
        setData(list.filter(predicate(e)));
      } else {
        setData(initialize ? list : []);
      }
    },
    [setData, initialize, list, predicate]
  );

  const reset = useCallback(() => {
    setValue("");
    setData(initialize ? list : []);
  }, [setData, list, initialize]);

  const Component = ({ variant = "filled" }) => (
    <InputGroup maxW={640} margin="auto">
      <InputLeftElement pointerEvents="none" children={<IoSearch />} />
      <Input
        autoFocus
        variant={variant}
        bg={"white"}
        onChange={(e) => {
          filter(e);
          setValue(e.target.value);
        }}
        value={value}
        placeholder="Buscar"
      />
    </InputGroup>
  );

  return [Component, data, reset];
}
