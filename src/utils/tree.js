class TreeNode {
  // every node's value must has a 'id' key
  constructor(value, parent = null, children = []) {
    // object, structure: {id, layer, question}
    this.value = value;
    // list
    this.children = children;
    // TreeNode instance
    this.parent = parent;
  }

  addChildNode(childNode) {
    this.children.push(childNode);
  }

  getParentNode() {
    return this.parent;
  }

  removeChildNode(childId) {
    this.children = this.children.filter((child) => child.value.id !== childId);
  }
}
class Tree {
  constructor() {
    this.root = new TreeNode({
      id: 0,
      layer: 0,
    });
    // record id-value mapping
    this.nodeIdMap = new Map();
    this.nodeIdMap.set(0, this.root);
  }

  /* get one node's layer based on its id
   */
  getLayer(nodeId) {
    if (this.nodeIdMap.has(nodeId)) {
      return this.nodeIdMap.get(nodeId).value.layer;
    } else {
      return -1;
    }
  }

  /* add node based on source id and targetValues (list)
   */
  addNodes(sourceId, targetValues) {
    const sourceNode = this.nodeIdMap.get(sourceId);
    // set correct layer key to targetValue
    targetValues.forEach((targetValue) => {
      targetValue.layer = sourceNode.value.layer + 1;
      // construct treenode for target
      const targetNode = new TreeNode(targetValue, sourceNode);
      // add child
      sourceNode.children.push(targetNode);

      // set nodeIdMap
      this.nodeIdMap.set(targetValue.id, targetNode);
    });
  }

  /* delete node based on id
   * return valueList of all deleted nodes
   */
  deleteNode(targetId) {
    const targetNode = this.nodeIdMap.get(targetId);
    let deletedValueList = [];
    if (targetNode) {
      // remove from parent's child
      const parentNode = targetNode.getParentNode();
      parentNode.removeChildNode(targetId);
      const deletedValueList = this.getDescendantList(targetId);
      // clear nodeIdMap
      this.nodeIdMap.delete(targetId);
      deletedValueList.forEach((value) => this.nodeIdMap.delete(value.id));

      // construct return value
      deletedValueList.push(targetNode.value);
    }

    return deletedValueList;
  }

  /* get all links in this tree
   * return linkList
   */
  getLinkList() {
    return getLinkListByNode(this.root);

    function getLinkListByNode(node) {
      const linkList = [];
      node.children.forEach((childNode) => {
        linkList.push({ source: node.value.id, target: childNode.value.id });
        const newLinkList = getLinkListByNode(childNode);
        linkList.push(...newLinkList);
      });
      return linkList;
    }
  }

  /* get valueList of all desendants for certain id (contains itself)
   * return valueList
   */
  getDescendantList(nodeId = this.root.value.id) {
    if (nodeId === this.root.value.id) {
      return Array.from(this.nodeIdMap.values(), (node) => node.value);
    } else {
      let descendantList = [];
      const node = this.nodeIdMap.get(nodeId);
      if (node) {
        descendantList = getDesListByNode(node);
      }
      return descendantList;
    }

    function getDesListByNode(node) {
      const descendantList = [];
      if (node) {
        descendantList.push(node.value);
        node.children.forEach((childNode) => {
          descendantList.push(childNode.value);
          const descendants = getDesListByNode(childNode);
          descendantList.push(...descendants);
        });
      }
      return descendantList;
    }
  }

  getQuesionPath(nodeId) {
    const node = this.nodeIdMap.get(nodeId);
    return getQuesionPathByNode(node);

    function getQuesionPathByNode(node) {
      let curNode = node;
      let res = [];
      while (curNode) {
        const question = curNode.value.question;
        res.push({
          id: curNode.value.id,
          question: question ? question : null,
        });
        curNode = curNode.parent;
      }
      return res;
    }
  }
}

export { Tree };
