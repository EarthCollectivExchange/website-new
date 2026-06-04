/* Interactive, expandable ecosystem tree */
function StatusBadge({ status, pulse, small }) {
  const s = window.EARTHOS.STATUS[status];
  if (!s) return null;
  return (
    <span className={`badge ${s.cls} ${pulse ? "pulse" : ""}`} style={small ? { fontSize: "0.62rem", padding: "0.32em 0.6em" } : null}>
      <span className="dot"></span>{s.label}
    </span>
  );
}

function TreeNode({ node, depth, defaultOpen, onNav }) {
  const hasKids = node.children && node.children.length;
  const [open, setOpen] = React.useState(!!defaultOpen);

  if (!hasKids) {
    return (
      <a className="tleaf" href={node.page ? `#/${node.page}` : "#"} onClick={(e) => { if (onNav && node.page) { } }}>
        <span className="node-dot" style={node.status ? { background: "currentColor" } : null}></span>
        <span>{node.name}</span>
        {node.status ? <span style={{ marginLeft: "auto" }}><StatusBadge status={node.status} small /></span> : null}
      </a>
    );
  }
  return (
    <div className={`tnode ${open ? "open" : ""}`}>
      <button className={`trow ${depth === 0 ? "root" : ""}`} onClick={() => setOpen(o => !o)}>
        <span className="tcaret">▶</span>
        <span className="node-dot"></span>
        <span className="tname">{node.name}</span>
        {node.status ? <span style={{ marginLeft: depth === 0 ? "0.4rem" : "auto" }}><StatusBadge status={node.status} /></span> : null}
        {node.desc ? <span className="tdesc">{node.desc}</span> : null}
      </button>
      <div className="tchildren">
        <div>
          {node.children.map((c, i) => (
            <TreeNode key={i} node={c} depth={depth + 1} onNav={onNav} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EcosystemTree({ compact }) {
  const data = window.EARTHOS.TREE;
  return (
    <div className="tree">
      {compact
        ? data.children.map((c, i) => <TreeNode key={i} node={c} depth={0} />)
        : <TreeNode node={data} depth={0} defaultOpen />}
    </div>
  );
}

Object.assign(window, { StatusBadge, EcosystemTree });
