const Footer = ({ length }) => {
  return (
    <footer>
      {length} {length === 1 ? "Item" : "Items"} in this list{" "}
    </footer>
  );
};

export default Footer;
