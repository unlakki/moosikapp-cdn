import xml from 'xml';
import { Resource } from 'yadisk-mgr';
import filesize from 'filesize';

const list = (items: Resource[]) => xml({
  ItemList: items.map((item) => ({
    Item: [
      {
        Name: decodeURI(item.name),
      },
      {
        Type: item.type,
      },
      {
        Size: item.size ? filesize(item.size) : 'N/A',
      },
    ],
  })),
});

export default list;
