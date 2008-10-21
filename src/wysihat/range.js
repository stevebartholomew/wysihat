/**
 * This document is work in progress. It implements w3c Range for browsers
 * that do not support it natively like Internet Explorer. The implementation
 * is cross-browser compatible but only gets binded if no w3c Range
 * implementation exists.
 *
 * @author Jorgen Horstink <mail@jorgenhorstink.nl>
 */

if (Prototype.Browser.IE) {
  function Range(ownerDocument) {
    this.ownerDocument = ownerDocument;

    this.startContainer = this.ownerDocument.documentElement;
    this.startOffset    = 0;
    this.endContainer   = this.ownerDocument.documentElement;
    this.endOffset      = 0;

    this.collapsed = true;
    this.commonAncestorContainer = _commonAncestorContainer(this.startContainer, this.endContainer);

    this.detached = false;

    this.START_TO_START = 0;
    this.START_TO_END   = 1;
    this.END_TO_END     = 2;
    this.END_TO_START   = 3;

    this.CLONE_CONTENTS   = 0;
    this.DELETE_CONTENTS  = 1;
    this.EXTRACT_CONTENTS = 2;
  }

  if (!document.createRange) {
    document.createRange = function () {
      return new Range(this);
    }
  }

  Object.extend(Range.prototype, {
    function cloneContents() {
      _processContents(this, this.CLONE_CONTENTS);
    }

    function cloneRange() {
      try {
        var clone = new Range(this.ownerDocument);
        // a range solely exists of these properties.
        clone.startContainer          = this.startContainer;
        clone.startOffset             = this.startOffset;
        clone.endContainer            = this.endContainer;
        clone.endOffset               = this.endOffset;
        clone.collapsed               = this.collapsed;
        clone.commonAncestorContainer = this.commonAncestorContainer;
        clone.detached                = this.detached;

        return clone;

      } catch (e) {}
    }

    function collapse(toStart) {
      if (toStart) {
        this.endContainer   = this.startContainer;
        this.endOffset      = this.startOffset;
      } else {
        this.startContainer = this.endContainer;
        this.startOffset    = this.endOffset;
      }
    }

    function compareBoundaryPoints(compareHow, sourceRange) {
      try {
        var cmnSelf, cmnSource, rootSelf, rootSource;

        // An exception is thrown if the two Ranges have different root containers.
        cmnSelf   = this.commonAncestorContainer;
        cmnSource = sourceRange.commonAncestorContainer;

        rootSelf = cmnSelf;
        while (rootSelf.parentNode) {
          rootSelf = rootSelf.parentNode;
        }

        rootSource = cmnSource;
        while (rootSource.parentNode) {
          rootSource = rootSource.parentNode;
        }

        switch (compareHow) {
          case this.START_TO_START:
            return _compareBoundaryPoints(this, this.startContainer, this.startOffset, sourceRange.startContainer, sourceRange.startOffset);
            break;
          case this.START_TO_END:
            return _compareBoundaryPoints(this, this.startContainer, this.startOffset, sourceRange.endContainer, sourceRange.endOffset);
            break;
          case this.END_TO_END:
            return _compareBoundaryPoints(this, this.endContainer, this.endOffset, sourceRange.endContainer, sourceRange.endOffset);
            break;
          case this.END_TO_START:
            return _compareBoundaryPoints(this, this.endContainer, this.endOffset, sourceRange.startContainer, sourceRange.startOffset);
            break;
        }
      } catch (e) {}
    }

    function deleteContents() {
      try {
        _processContents(this, this.DELETE_CONTENTS);
      } catch (e) {}
    }

    function detach() {
      this.detached = true;
    }

    function extractContents() {
      try {
        return _processContents(this, this.EXTRACT_CONTENTS);
      } catch (e) {}
    }

    function insertNode(newNode) {
      try {
        var n, newText, offset;

        switch (this.startContainer.nodeType) {
          case 4:
          case 3:

            newText = this.startContainer.splitText(this.startOffset);

            this.startContainer.parentNode.insertBefore(newNode, newText);
            break;
          default:
            if (this.startContainer.childNodes.length == 0) {
              offset = null;
            } else {
              offset = this.startContainer.childNodes(this.startOffset);
            }
            this.startContainer.insertBefore(newNode, offset);
        }
      } catch (e) {}
    }

    function selectNode(refNode) {
      this.setStartBefore(refNode);
      this.setEndAfter(refNode);
    }

    function selectNodeContents(refNode) {
      this.setStart(refNode, 0);
      this.setEnd(refNode, refNode.childNodes.length);
    }

    function setStart(refNode, offset) {
      try {
        var endRootContainer, startRootContainer;

        this.startContainer = refNode;
        this.startOffset    = offset;

        // If one boundary-point of a Range is set to have a root container 
        // other than the current one for the Range, the Range is collapsed to 
        // the new position. This enforces the restriction that both boundary-
        // points of a Range must have the same root container.
        endRootContainer = this.endContainer;
        while (endRootContainer.parentNode) {
          endRootContainer = endRootContainer.parentNode;
        }
        startRootContainer = this.startContainer;
        while (startRootContainer.parentNode) {
          startRootContainer = startRootContainer.parentNode;
        }
        if (startRootContainer != endRootContainer) {
          this.collapse(true);
        } else {
          // The start position of a Range is guaranteed to never be after the 
          // end position. To enforce this restriction, if the start is set to 
          // be at a position after the end, the Range is collapsed to that 
          // position.
          if (_compareBoundaryPoints(this, this.startContainer, this.startOffset, this.endContainer, this.endOffset) > 0) {
            this.collapse(true);
          }
        }

        this.collapsed = _isCollapsed(this);

        this.commonAncestorContainer = _commonAncestorContainer(this.startContainer, this.endContainer);
      } catch (e) {}
    }

    function setStartAfter(refNode) {
      this.setStart(refNode.parentNode, _nodeIndex(refNode) + 1);
    }

    function setStartBefore(refNode) {
      this.setStart(refNode.parentNode, _nodeIndex(refNode));
    }

    function setEnd(refNode, offset) {
      try {
        this.endContainer = refNode;
        this.endOffset    = offset;

        // If one boundary-point of a Range is set to have a root container 
        // other than the current one for the Range, the Range is collapsed to 
        // the new position. This enforces the restriction that both boundary-
        // points of a Range must have the same root container.
        endRootContainer = this.endContainer;
        while (endRootContainer.parentNode) {
          endRootContainer = endRootContainer.parentNode;
        }
        startRootContainer = this.startContainer;
        while (startRootContainer.parentNode) {
          startRootContainer = startRootContainer.parentNode;
        }
        if (startRootContainer != endRootContainer) {
          this.collapse(false);
        } else {
          // ... Similarly, if the end is set to be at a position before the 
          // start, the Range is collapsed to that position.
          if (_compareBoundaryPoints(this, this.startContainer, this.startOffset, this.endContainer, this.endOffset) > 0) {
            this.collapse(false);
          }
        }

        this.collapsed = _isCollapsed(this);

        this.commonAncestorContainer = _commonAncestorContainer(this.startContainer, this.endContainer);

      } catch (e) {}
    }

    function setEndAfter(refNode) {
      this.setEnd(refNode.parentNode, _nodeIndex(refNode) + 1);
    }

    function setEndBefore(refNode) {
      this.setEnd(refNode.parentNode, _nodeIndex(refNode));
    }

    function surroundContents(newParent) {
      try {
        var n, fragment;

        // empty the newParent
        while (newParent.firstChild) {
          newParent.removeChild(newParent.firstChild);
        }

        fragment = this.extractContents();
        this.insertNode(newParent);
        newParent.appendChild(fragment);
        this.selectNode(newParent);
      } catch (e) {}
    }


    function _compareBoundaryPoints(range, containerA, offsetA, containerB, offsetB) {
      var c, offsetC, n, cmnRoot, childA;
      // In the first case the boundary-points have the same container. A is before B 
      // if its offset is less than the offset of B, A is equal to B if its offset is 
      // equal to the offset of B, and A is after B if its offset is greater than the 
      // offset of B.
      if (containerA == containerB) {
        if (offsetA == offsetB) {
          return 0; // equal
        } else if (offsetA < offsetB) {
          return -1; // before
        } else {
          return 1; // after
        }
      }


      // In the second case a child node C of the container of A is an ancestor 
      // container of B. In this case, A is before B if the offset of A is less than or 
      // equal to the index of the child node C and A is after B otherwise.
      c = containerB;
      while (c && c.parentNode != containerA) {
        c = c.parentNode;
      }
      if (c) {
        offsetC = 0;
        n = containerA.firstChild;
        while (n != c && offsetC < offsetA) {
          offsetC++;
          n = n.nextSibling;
        }
        if (offsetA <= offsetC) {
          return -1; // before
        } else {
          return 1; // after
        }
      }

      // In the third case a child node C of the container of B is an ancestor container 
      // of A. In this case, A is before B if the index of the child node C is less than 
      // the offset of B and A is after B otherwise.
      c = containerA;
      while (c && c.parentNode != containerB) {
        c = c.parentNode;
      }
      if (c) {
        offsetC = 0;
        n = containerB.firstChild;
        while (n != c && offsetC < offsetB) {
          offsetC++;
          n = n.nextSibling;
        }
        if (offsetC < offsetB) {
          return -1; // before
        } else {
          return 1; // after
        }
      }

      // In the fourth case, none of three other cases hold: the containers of A and B 
      // are siblings or descendants of sibling nodes. In this case, A is before B if 
      // the container of A is before the container of B in a pre-order traversal of the
      // Ranges' context tree and A is after B otherwise.
      cmnRoot = range._commonAncestorContainer(containerA, containerB);
      childA = containerA;
      while (childA && childA.parentNode != cmnRoot) {
        childA = childA.parentNode;  
      }
      if (!childA) {
        childA = cmnRoot;
      }
      childB = containerB;
      while (childB && childB.parentNode != cmnRoot) {
        childB = childB.parentNode;
      }
      if (!childB) {
        childB = cmnRoot;
      }

      if (childA == childB) {
        return 0; // equal
      }

      n = cmnRoot.firstChild;
      while (n) {
        if (n == childA) {
          return -1; // before
        }
        if (n == childB) {
          return 1; // after
        }
        n = n.nextSibling;
      }

      // can never happen...
    }

    function _commonAncestorContainer(containerA, containerB) {
      var parentStart = containerA, parentEnd;
      while (parentStart) {
        parentEnd = containerB;
        while (parentEnd && parentStart != parentEnd) {
          parentEnd = parentEnd.parentNode;
        }
        if (parentStart == parentEnd) {
          break;
        }
        parentStart = parentStart.parentNode;
      }

      if (!parentStart && containerA.ownerDocument) {
        return containerA.ownerDocument.documentElement;
      }

      return parentStart;
    }

    function _isCollapsed(range) {
      return (range.startContainer == range.endContainer && range.startOffset == range.endOffset);
    }

    function _offsetInCharacters(node) {
      switch (node.nodeType) {
        case 4:
        case 8:
        case 1:
        case Node.PROCESSION_INSTRUCTION_NODE:
          return true;
        default:
          return false;
      }
    }

    function _processContents(range, action) {
      try {

        var cmnRoot, partialStart = null, partialEnd = null, fragment, n, c, i;
        var leftContents, leftParent, leftContentsParent;
        var rightContents, rightParent, rightContentsParent;
        var next, prev;
        var processStart, processEnd;
        if (range.collapsed) {
          return;
        }

        cmnRoot = range.commonAncestorContainer;

        if (range.startContainer != cmnRoot) {
          partialStart = range.startContainer;
          while (partialStart.parentNode != cmnRoot) {
            partialStart = partialStart.parentNode;
          }
        }

        if (range.endContainer != cmnRoot) {
          partialEnd = range.endContainer;
          while (partialEnd.parentNode != cmnRoot) {
            partialEnd = partialEnd.parentNode;
          }
        }

        if (action == range.EXTRACT_CONTENTS || action == range.CLONE_CONTENTS) {
          fragment = range.ownerDocument.createDocumentFragment();
        }

        if (range.startContainer == range.endContainer) {
          switch (range.startContainer.nodeType) {
            case 4:
            case 8:
            case 3:
              if (action == range.EXTRACT_CONTENTS || action == range.CLONE_CONTENTS) {
                c = range.startContainer.cloneNode();
                c.deleteData(range.endOffset, range.startContainer.data.length - range.endOffset);
                c.deleteData(0, range.startOffset);
                fragment.appendChild(c);
              }
              if (action == range.EXTRACT_CONTENTS || action == range.DELETE_CONTENTS) {
                range.startContainer.deleteData(range.startOffset, range.endOffset - range.startOffset);
              }
              break;
            case 7:
              //
              break;
            default:
              n = range.startContainer.firstChild;
              for (i = 0; i < range.startOffset; i++) {
                n = n.nextSibling;
              }
              while (n && i < range.endOffset) {
                next = n.nextSibling;
                if (action == range.EXTRACT_CONTENTS) {
                  fragment.appendChild(n);
                } else if (action == range.CLONE_CONTENTS) {
                  fragment.appendChild(n.cloneNode());
                } else {
                  range.startContainer.removeChild(n);
                }
                n = next;
                i++;
              }
          }
          range.collapse(true);
          return fragment;
        }


        if (range.startContainer != cmnRoot) {
          switch (range.startContainer.nodeType) {
            case 4:
            case 8:
            case 3:
              if (action == range.EXTRACT_CONTENTS || action == range.CLONE_CONTENTS) {
                c = range.startContainer.cloneNode(true);
                c.deleteData(0, range.startOffset);
                leftContents = c;
              }
              if (action == range.EXTRACT_CONTENTS || action == range.DELETE_CONTENTS) {
                range.startContainer.deleteData(range.startOffset, range.startContainer.data.length - range.startOffset);
              }
              break;
            case 7:
              //
              break;
            default:
              if (action == range.EXTRACT_CONTENTS || action == range.CLONE_CONTENTS) {
                leftContents = range.startContainer.cloneNode(false);
              }
              n = range.startContainer.firstChild;
              for (i = 0; i < range.startOffset; i++) {
                n = n.nextSibling;
              }
              while (n && i < range.endOffset) {
                next = n.nextSibling;
                if (action == range.EXTRACT_CONTENTS) {
                  fragment.appendChild(n);
                } else if (action == range.CLONE_CONTENTS) {
                  fragment.appendChild(n.cloneNode());
                } else {
                  range.startContainer.removeChild(n);
                }
                n = next;
                i++;
              }
          }

          leftParent = range.startContainer.parentNode;
          n = range.startContainer.nextSibling;
          for(; leftParent != cmnRoot; leftParent = leftParent.parentNode) {
            if (action == range.EXTRACT_CONTENTS || action == range.CLONE_CONTENTS) {
              leftContentsParent = leftParent.cloneNode(false);
              leftContentsParent.appendChild(leftContents);
              leftContents = leftContentsParent;
            }

            for (; n; n = next) {
              next = n.nextSibling;
              if (action == range.EXTRACT_CONTENTS) {
                leftContents.appendChild(n);
              } else if (action == range.CLONE_CONTENTS) {
                leftContents.appendChild(n.cloneNode(true));
              } else {
                leftParent.removeChild(n);
              }
            }
            n = leftParent.nextSibling;
          }
        }

        if (range.endContainer != cmnRoot) {
          switch (range.endContainer.nodeType) {
            case 4:
            case 8:
            case 3:
              if (action == range.EXTRACT_CONTENTS || action == range.CLONE_CONTENTS) {
                c = range.endContainer.cloneNode(true);
                c.deleteData(range.endOffset, range.endContainer.data.length - range.endOffset);
                rightContents = c;
              }
              if (action == range.EXTRACT_CONTENTS || action == range.DELETE_CONTENTS) {
                range.endContainer.deleteData(0, range.endOffset);
              }
              break;
            case 7:
              //
              break;
            default:
              if (action == range.EXTRACT_CONTENTS || action == range.CLONE_CONTENTS) {
                rightContents = range.endContainer.cloneNode(false);
              }
              n = range.endContainer.firstChild;
              if (n && range.endOffset) {
                for (i = 0; i+1 < range.endOffset; i++) {
                  next = n.nextSibling;
                  if (!next) {
                    break;
                  }
                  n = next;
                }
                for (; n; n = prev) {
                  prev = n.previousSibling;
                  if (action == range.EXTRACT_CONTENTS) {
                    rightContents.insertBefore(n, rightContents.firstChild);
                  } else if (action == CLONE_CONTENTS) {
                    rightContents.insertBefore(n.cloneNode(True), rightContents.firstChild);
                  } else {
                    range.endContainer.removeChild(n);
                  }
                }
              }
          }

          rightParent = range.endContainer.parentNode;
          n = range.endContainer.previousSibling;
          for(; rightParent != cmnRoot; rightParent = rightParent.parentNode) {
            if (action == range.EXTRACT_CONTENTS || action == range.CLONE_CONTENTS) {
              rightContentsParent = rightContents.cloneNode(false);
              rightContentsParent.appendChild(rightContents);
              rightContents = rightContentsParent;
            }

            for (; n; n = prev) {
              prev = n.previousSibling;
              if (action == range.EXTRACT_CONTENTS) {
                rightContents.insertBefore(n, rightContents.firstChild);
              } else if (action == range.CLONE_CONTENTS) {
                rightContents.appendChild(n.cloneNode(true), rightContents.firstChild);
              } else {
                rightParent.removeChild(n);
              }
            }
            n = rightParent.previousSibling;
          }
        }

        if (range.startContainer == cmnRoot) {
          processStart = range.startContainer.firstChild;
          for (i = 0; i < range.startOffset; i++) {
            processStart = processStart.nextSibling;
          }
        } else {
          processStart = range.startContainer;
          while (processStart.parentNode != cmnRoot) {
            processStart = processStart.parentNode;
          }
          processStart = processStart.nextSibling;
        }
        if (range.endContainer == cmnRoot) {
          processEnd = range.endContainer.firstChild;
          for (i = 0; i < range.endOffset; i++) {
            processEnd = processEnd.nextSibling;
          }
        } else {
          processEnd = range.endContainer;
          while (processEnd.parentNode != cmnRoot) {
            processEnd = processEnd.parentNode;
          }
        }

        if ((action == range.EXTRACT_CONTENTS || action == range.CLONE_CONTENTS) && leftContents) {
          fragment.appendChild(leftContents);
        }

        if (processStart) {
          for (n = processStart; n && n != processEnd; n = next) {
            next = n.nextSibling;
            if (action == range.EXTRACT_CONTENTS) {
              fragment.appendChild(n);
            } else if (action == range.CLONE_CONTENTS) {
              fragment.appendChild(n.cloneNode(true));
            } else {
              cmnRoot.removeChild(n);
            }
          }
        }

        if ((action == range.EXTRACT_CONTENTS || action == range.CLONE_CONTENTS) && rightContents) {
          fragment.appendChild(rightContents);
        }

        if (action == range.EXTRACT_CONTENTS || action == range.DELETE_CONTENTS) {
          if (!partialStart && !partialEnd) {
            range.collapse(true);
          } else if (partialStart) {
            range.startContainer = partialStart.parentNode;
            range.endContainer = partialStart.parentNode;
            range.startOffset = range.endOffset = range._nodeIndex(partialStart) + 1;
          } else if (partialEnd) {
            range.startContainer = partialEnd.parentNode;
            range.endContainer = partialEnd.parentNode;
            range.startOffset = range.endOffset = range._nodeIndex(partialEnd);
          }
        }

        return fragment;

      } catch (e) {}  
    }

    function _nodeIndex(refNode) {
      var nodeIndex = 0;
      while (refNode.previousSibling) {
        nodeIndex++;
        refNode = refNode.previousSibling;
      }
      return nodeIndex;
    }

    return {
      setStart:       setStart,
      setEnd:         setEnd,
      setStartBefore: setStartBefore,
      setStartAfter:  setStartAfter,
      setEndBefore:   setEndBefore,
      setEndAfter:    setEndAfter,

      collapse: collapse,

      selectNode:         selectNode,
      selectNodeContents: selectNodeContents,

      compareBoundaryPoints: compareBoundaryPoints,

      deleteContents:  deleteContents,
      extractContents: extractContents,
      cloneContents:   cloneContents,

      insertNode:       insertNode,
      surroundContents: surroundContents

      cloneRange: cloneRange,
      toString:   toString,
      detach:     detach,
    };
  });
}
