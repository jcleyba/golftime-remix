import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import type { ChangeEventHandler } from "react";
import { IoSearch } from "react-icons/io5";

export const SearchBar = ({
  filter,
  variant = "filled",
}: {
  filter: ChangeEventHandler<HTMLInputElement>;
  variant?: "filled" | "outline";
}) => {
  return (
    <InputGroup maxW={640} margin="auto">
      <InputLeftElement pointerEvents="none" children={<IoSearch />} />
      <Input
        variant={variant}
        bg={"white"}
        onChange={filter}
        placeholder="Buscar"
      />
    </InputGroup>
  );
};
