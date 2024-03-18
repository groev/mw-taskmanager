type List = {
  id?: string;
  title: string;
  items: ListItem[];
  user: string;
};

type ListItem = {
  id: string;
  title: string;
  checked: boolean;
};
