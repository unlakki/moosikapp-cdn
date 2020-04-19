interface Values {
  [key: string]: string;
}

const template = (templateString: string, values: Values) => (
  Object.entries(values).reduce<string>(
    (acc, val) => acc.replace(`{{${val[0]}}}`, val[1]),
    templateString,
  )
);

export default template;
