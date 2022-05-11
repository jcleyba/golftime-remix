import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import type { Column } from "react-table";
import { usePagination, useTable } from "react-table";

export function MiniTable({
  title,
  columns,
  data,
}: {
  title?: string;
  columns: Column<any>[];
  data: any[];
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    pageCount,
    state: { pageIndex },
    nextPage,
    previousPage,
  } = useTable({ columns, data }, usePagination);

  return (
    <Box
      w={"full"}
      bg={useColorModeValue("white", "gray.900")}
      boxShadow={"2xl"}
      rounded={"lg"}
      p={6}
      textAlign={"center"}
    >
      {!!title && (
        <Heading fontSize={"lg"} marginY={5}>
          {title}
        </Heading>
      )}
      <Table {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup, i) => (
            <Tr {...headerGroup.getHeaderGroupProps()} key={i}>
              {headerGroup.headers.map((column, j) => (
                <Th {...column.getHeaderProps()} key={j}>
                  {column.render("Header")}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {page.map((row: any, i: number) => {
            prepareRow(row);
            return (
              <Tr {...row.getRowProps()} key={i}>
                {row.cells.map((cell: any, j: number) => {
                  return (
                    <Td {...cell.getCellProps()} key={j}>
                      {cell.render("Cell")}
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <Flex marginY={5} justifyContent="center" alignItems={"center"}>
        <Button onClick={previousPage} size="sm">
          Prev
        </Button>
        <Box marginX={5}>
          Pagina {pageIndex + 1} de {pageCount}
        </Box>
        <Button onClick={nextPage} size="sm">
          Prox
        </Button>
      </Flex>
    </Box>
  );
}
