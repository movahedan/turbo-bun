# 🚀 InterShell - Next Generation CLI Framework

> **Interactive CLI applications made simple with page-based navigation and state management**

InterShell is a modern, type-safe CLI framework for building interactive command-line applications. It provides a clean separation between I/O handling and application logic through an event-driven architecture with page-based navigation.

## ✨ Features

- **🎮 Page-Based Navigation** - Structure your CLI as pages with clean transitions
- **📊 State Management** - Redux-like state management with reducers and actions
- **🎨 Enhanced Colors** - Rich color support with RGB, HSL, and gradient effects
- **🔧 Type Safety** - Full TypeScript support with strict type checking
- **⚡ Event-Driven** - Clean event system for better testability and extensibility
- **🎯 Zero Dependencies** - Built from the ground up for Bun with no external deps
- **🧪 Testable** - Clean architecture makes testing individual components easy

## 📦 Packages

InterShell is organized as a monorepo with multiple packages:

### `../core`
Foundation utilities and types for the InterShell framework:
- Enhanced colorify system with RGB, HSL, and gradient support
- WrapShell script creation framework with type-safe argument parsing
- CLI utility functions for common operations
- Comprehensive type definitions

### `@intershell/interactive`
Interactive CLI framework with page-based navigation:
- Main InterShell framework orchestrator
- Event-based InteractiveCLI implementation
- Page system with builders and common page types
- State management with reducers and actions

<svg aria-roledescription="flowchart-v2" role="graphics-document document" viewBox="-8 -8 878.8938598632812 301" style="max-width: 878.8938598632812px;" xmlns="http://www.w3.org/2000/svg" width="100%" id="mermaid-svg-1755831685709-tfz8nz33o"><style>#mermaid-svg-1755831685709-tfz8nz33o{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;fill:#cccccc;}#mermaid-svg-1755831685709-tfz8nz33o .error-icon{fill:#5a1d1d;}#mermaid-svg-1755831685709-tfz8nz33o .error-text{fill:#f48771;stroke:#f48771;}#mermaid-svg-1755831685709-tfz8nz33o .edge-thickness-normal{stroke-width:2px;}#mermaid-svg-1755831685709-tfz8nz33o .edge-thickness-thick{stroke-width:3.5px;}#mermaid-svg-1755831685709-tfz8nz33o .edge-pattern-solid{stroke-dasharray:0;}#mermaid-svg-1755831685709-tfz8nz33o .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-svg-1755831685709-tfz8nz33o .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-svg-1755831685709-tfz8nz33o .marker{fill:#cccccc;stroke:#cccccc;}#mermaid-svg-1755831685709-tfz8nz33o .marker.cross{stroke:#cccccc;}#mermaid-svg-1755831685709-tfz8nz33o svg{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;}#mermaid-svg-1755831685709-tfz8nz33o .label{font-family:"trebuchet ms",verdana,arial,sans-serif;color:#cccccc;}#mermaid-svg-1755831685709-tfz8nz33o .cluster-label text{fill:#e7e7e7;}#mermaid-svg-1755831685709-tfz8nz33o .cluster-label span,#mermaid-svg-1755831685709-tfz8nz33o p{color:#e7e7e7;}#mermaid-svg-1755831685709-tfz8nz33o .label text,#mermaid-svg-1755831685709-tfz8nz33o span,#mermaid-svg-1755831685709-tfz8nz33o p{fill:#cccccc;color:#cccccc;}#mermaid-svg-1755831685709-tfz8nz33o .node rect,#mermaid-svg-1755831685709-tfz8nz33o .node circle,#mermaid-svg-1755831685709-tfz8nz33o .node ellipse,#mermaid-svg-1755831685709-tfz8nz33o .node polygon,#mermaid-svg-1755831685709-tfz8nz33o .node path{fill:#1e1e1e;stroke:#6b6b6b;stroke-width:1px;}#mermaid-svg-1755831685709-tfz8nz33o .flowchart-label text{text-anchor:middle;}#mermaid-svg-1755831685709-tfz8nz33o .node .label{text-align:center;}#mermaid-svg-1755831685709-tfz8nz33o .node.clickable{cursor:pointer;}#mermaid-svg-1755831685709-tfz8nz33o .arrowheadPath{fill:#e1e1e1;}#mermaid-svg-1755831685709-tfz8nz33o .edgePath .path{stroke:#cccccc;stroke-width:2.0px;}#mermaid-svg-1755831685709-tfz8nz33o .flowchart-link{stroke:#cccccc;fill:none;}#mermaid-svg-1755831685709-tfz8nz33o .edgeLabel{background-color:#1e1e1e99;text-align:center;}#mermaid-svg-1755831685709-tfz8nz33o .edgeLabel rect{opacity:0.5;background-color:#1e1e1e99;fill:#1e1e1e99;}#mermaid-svg-1755831685709-tfz8nz33o .labelBkg{background-color:rgba(30, 30, 30, 0.5);}#mermaid-svg-1755831685709-tfz8nz33o .cluster rect{fill:#3a3d41;stroke:#303031;stroke-width:1px;}#mermaid-svg-1755831685709-tfz8nz33o .cluster text{fill:#e7e7e7;}#mermaid-svg-1755831685709-tfz8nz33o .cluster span,#mermaid-svg-1755831685709-tfz8nz33o p{color:#e7e7e7;}#mermaid-svg-1755831685709-tfz8nz33o div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:12px;background:#4d4d4d;border:1px solid #007fd4;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-svg-1755831685709-tfz8nz33o .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#cccccc;}#mermaid-svg-1755831685709-tfz8nz33o :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}</style><g><marker orient="auto" markerHeight="12" markerWidth="12" markerUnits="userSpaceOnUse" refY="5" refX="6" viewBox="0 0 10 10" class="marker flowchart" id="mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd"><path style="stroke-width: 1; stroke-dasharray: 1, 0;" class="arrowMarkerPath" d="M 0 0 L 10 5 L 0 10 z"/></marker><marker orient="auto" markerHeight="12" markerWidth="12" markerUnits="userSpaceOnUse" refY="5" refX="4.5" viewBox="0 0 10 10" class="marker flowchart" id="mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointStart"><path style="stroke-width: 1; stroke-dasharray: 1, 0;" class="arrowMarkerPath" d="M 0 5 L 10 10 L 10 0 z"/></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5" refX="11" viewBox="0 0 10 10" class="marker flowchart" id="mermaid-svg-1755831685709-tfz8nz33o_flowchart-circleEnd"><circle style="stroke-width: 1; stroke-dasharray: 1, 0;" class="arrowMarkerPath" r="5" cy="5" cx="5"/></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5" refX="-1" viewBox="0 0 10 10" class="marker flowchart" id="mermaid-svg-1755831685709-tfz8nz33o_flowchart-circleStart"><circle style="stroke-width: 1; stroke-dasharray: 1, 0;" class="arrowMarkerPath" r="5" cy="5" cx="5"/></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5.2" refX="12" viewBox="0 0 11 11" class="marker cross flowchart" id="mermaid-svg-1755831685709-tfz8nz33o_flowchart-crossEnd"><path style="stroke-width: 2; stroke-dasharray: 1, 0;" class="arrowMarkerPath" d="M 1,1 l 9,9 M 10,1 l -9,9"/></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5.2" refX="-1" viewBox="0 0 11 11" class="marker cross flowchart" id="mermaid-svg-1755831685709-tfz8nz33o_flowchart-crossStart"><path style="stroke-width: 2; stroke-dasharray: 1, 0;" class="arrowMarkerPath" d="M 1,1 l 9,9 M 10,1 l -9,9"/></marker><g class="root"><g class="clusters"/><g class="edgePaths"><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-A LE-A1" id="L-A-A1-0" d="M81.61,33.75L75.187,37.917C68.764,42.083,55.919,50.417,49.496,57.867C43.073,65.317,43.073,71.883,43.073,75.167L43.073,78.45"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-A LE-A2" id="L-A-A2-0" d="M133.634,33.75L140.057,37.917C146.48,42.083,159.326,50.417,165.748,57.867C172.171,65.317,172.171,71.883,172.171,75.167L172.171,78.45"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-A LE-A3" id="L-A-A3-0" d="M162.951,28.354L187.369,33.42C211.787,38.486,260.623,48.618,285.041,56.967C309.46,65.317,309.46,71.883,309.46,75.167L309.46,78.45"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-B LE-C" id="L-B-C-0" d="M410.723,109.288L382.431,114.823C354.14,120.359,297.556,131.429,269.265,140.248C240.973,149.067,240.973,155.633,240.973,158.917L240.973,162.2"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-B LE-D" id="L-B-D-0" d="M410.723,113.526L394.15,118.355C377.577,123.184,344.431,132.842,327.859,144.65C311.286,156.458,311.286,170.417,311.286,184.375C311.286,198.333,311.286,212.292,340.776,224.84C370.266,237.388,429.246,248.525,458.736,254.094L488.226,259.663"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-B LE-E" id="L-B-E-0" d="M499.277,109.451L526.911,114.959C554.544,120.467,609.811,131.484,644.53,141.463C679.249,151.442,693.42,160.384,700.506,164.854L707.591,169.325"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-C LE-F" id="L-C-F-0" d="M215.54,201.25L209.26,205.417C202.981,209.583,190.421,217.917,184.141,225.367C177.861,232.817,177.861,239.383,177.861,242.667L177.861,245.95"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-C LE-D" id="L-C-D-0" d="M240.973,201.25L240.973,205.417C240.973,209.583,240.973,217.917,282.176,227.991C323.378,238.065,405.783,249.88,446.985,255.787L488.188,261.694"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-H LE-D" id="L-H-D-0" d="M402.767,201.25L402.767,205.417C402.767,209.583,402.767,217.917,417.037,226.67C431.307,235.424,459.848,244.598,474.118,249.185L488.389,253.772"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-I LE-J" id="L-I-J-0" d="M790.327,33.75L782.179,37.917C774.032,42.083,757.737,50.417,749.589,57.867C741.442,65.317,741.442,71.883,741.442,75.167L741.442,78.45"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-I LE-D" id="L-I-D-0" d="M819.926,33.75L819.087,37.917C818.248,42.083,816.57,50.417,815.731,61.563C814.893,72.708,814.893,86.667,814.893,100.625C814.893,114.583,814.893,128.542,814.893,142.5C814.893,156.458,814.893,170.417,814.893,184.375C814.893,198.333,814.893,212.292,775.392,225.139C735.891,237.987,656.89,249.725,617.39,255.593L577.889,261.462"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-J LE-E" id="L-J-E-0" d="M741.442,117.5L741.442,121.667C741.442,125.833,741.442,134.167,740.652,141.641C739.862,149.115,738.283,155.73,737.493,159.037L736.703,162.345"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-K LE-D" id="L-K-D-0" d="M528.617,201.25L528.617,205.417C528.617,209.583,528.617,217.917,528.964,225.372C529.311,232.826,530.006,239.403,530.353,242.691L530.701,245.979"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-L LE-D" id="L-L-D-0" d="M630.029,201.25L630.029,205.417C630.029,209.583,630.029,217.917,621.19,225.9C612.35,233.883,594.671,241.516,585.831,245.333L576.991,249.149"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-E LE-D" id="L-E-D-0" d="M731.442,201.25L731.442,205.417C731.442,209.583,731.442,217.917,705.84,227.487C680.239,237.057,629.035,247.864,603.434,253.268L577.832,258.671"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-C LE-D" id="L-C-D-1" d="M255.141,201.25L258.639,205.417C262.137,209.583,269.133,217.917,307.977,227.844C346.821,237.772,417.512,249.295,452.858,255.056L488.203,260.817"/><path marker-end="url(#mermaid-svg-1755831685709-tfz8nz33o_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-I LE-D" id="L-I-D-1" d="M827.986,33.75L829.137,37.917C830.288,42.083,832.59,50.417,833.741,61.563C834.893,72.708,834.893,86.667,834.893,100.625C834.893,114.583,834.893,128.542,834.893,142.5C834.893,156.458,834.893,170.417,834.893,184.375C834.893,198.333,834.893,212.292,792.06,225.213C749.227,238.134,663.562,250.018,620.729,255.96L577.896,261.902"/></g><g class="edgeLabels"><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><foreignObject height="0" width="0"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="edgeLabel"></span></div></foreignObject></g></g></g><g class="nodes"><g transform="translate(107.62206649780273, 16.875)" id="flowchart-A-1059" class="node default default flowchart-label"><rect height="33.75" width="110.65754699707031" y="-16.875" x="-55.328773498535156" ry="0" rx="0" style="fill:#fff3e0;" class="basic label-container"/><g transform="translate(-47.828773498535156, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="95.65754699707031"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">Core Package</span></div></foreignObject></g></g><g transform="translate(43.072914123535156, 100.625)" id="flowchart-A1-1060" class="node default default flowchart-label"><rect height="33.75" width="86.14582824707031" y="-16.875" x="-43.072914123535156" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(-35.572914123535156, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="71.14582824707031"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">colorify.ts</span></div></foreignObject></g></g><g transform="translate(172.1712188720703, 100.625)" id="flowchart-A2-1062" class="node default default flowchart-label"><rect height="33.75" width="72.05078125" y="-16.875" x="-36.025390625" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(-28.525390625, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="57.05078125"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">types.ts</span></div></foreignObject></g></g><g transform="translate(309.4596290588379, 100.625)" id="flowchart-A3-1064" class="node default default flowchart-label"><rect height="33.75" width="102.52603912353516" y="-16.875" x="-51.26301956176758" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(-43.76301956176758, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="87.52603912353516"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">wrapshell.ts</span></div></foreignObject></g></g><g transform="translate(454.99999237060547, 100.625)" id="flowchart-B-1065" class="node default default flowchart-label"><rect height="33.75" width="88.5546875" y="-16.875" x="-44.27734375" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(-36.77734375, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="73.5546875"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">Changelog</span></div></foreignObject></g></g><g transform="translate(240.97330474853516, 184.375)" id="flowchart-C-1066" class="node default default flowchart-label"><rect height="33.75" width="70.625" y="-16.875" x="-35.3125" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(-27.8125, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="55.625"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">Commit</span></div></foreignObject></g></g><g transform="translate(533.0403575897217, 268.125)" id="flowchart-D-1068" class="node default default flowchart-label"><rect height="33.75" width="79.21223449707031" y="-16.875" x="-39.606117248535156" ry="0" rx="0" style="fill:#e1f5fe;" class="basic label-container"/><g transform="translate(-32.106117248535156, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="64.21223449707031"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">Packages</span></div></foreignObject></g></g><g transform="translate(731.4420433044434, 184.375)" id="flowchart-E-1070" class="node default default flowchart-label"><rect height="33.75" width="38.73697853088379" y="-16.875" x="-19.368489265441895" ry="0" rx="0" style="fill:#f3e5f5;" class="basic label-container"/><g transform="translate(-11.868489265441895, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="23.73697853088379"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">Tag</span></div></foreignObject></g></g><g transform="translate(177.86132717132568, 268.125)" id="flowchart-F-1072" class="node default default flowchart-label"><rect height="33.75" width="33.23567581176758" y="-16.875" x="-16.61783790588379" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(-9.117837905883789, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="18.235675811767578"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">PR</span></div></foreignObject></g></g><g transform="translate(402.7669219970703, 184.375)" id="flowchart-H-1075" class="node default default flowchart-label"><rect height="33.75" width="112.96223449707031" y="-16.875" x="-56.481117248535156" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(-48.981117248535156, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="97.96223449707031"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">Commit Rules</span></div></foreignObject></g></g><g transform="translate(823.3235530853271, 16.875)" id="flowchart-I-1077" class="node default default flowchart-label"><rect height="33.75" width="79.140625" y="-16.875" x="-39.5703125" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(-32.0703125, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="64.140625"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">Compose</span></div></foreignObject></g></g><g transform="translate(741.4420433044434, 100.625)" id="flowchart-J-1078" class="node default default flowchart-label"><rect height="33.75" width="76.90103912353516" y="-16.875" x="-38.45051956176758" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(-30.950519561767578, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="61.901039123535156"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">Affected</span></div></foreignObject></g></g><g transform="translate(528.616527557373, 184.375)" id="flowchart-K-1083" class="node default default flowchart-label"><rect height="33.75" width="38.73697853088379" y="-16.875" x="-19.368489265441895" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(-11.868489265441895, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="23.73697853088379"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">Tag</span></div></foreignObject></g></g><g transform="translate(630.0292854309082, 184.375)" id="flowchart-L-1085" class="node default default flowchart-label"><rect height="33.75" width="64.08853912353516" y="-16.875" x="-32.04426956176758" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(-24.544269561767578, -9.375)" style="" class="label"><rect/><foreignObject height="18.75" width="49.088539123535156"><div style="display: inline-block; white-space: nowrap;" xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel">Branch</span></div></foreignObject></g></g></g></g></g></svg>

## 🚀 Quick Start

### Installation

```bash
# Install the packages you need
bun add ../core @intershell/interactive

# Or with npm
npm install ../core @intershell/interactive
```

### Basic Example

```typescript
import { InterShellFramework, PageBuilder } from '@intershell/interactive';
import { colorify } from '../core';

// Define your application state
interface AppState {
  name: string;
  confirmed: boolean;
}

// Create pages with the PageBuilder
const pages = [
  PageBuilder.create<AppState>('input', 'Enter Name')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(colorify.bold('👤 What is your name?'));
      
      const name = await cli.prompt('Name:', {
        clearScreen: false,
        allowEmpty: false,
      });
      
      // Update state directly (or use actions/reducers for complex apps)
      state.name = name;
    })
    .handleKey(() => null)
    .getNextAction((state) => ({ type: 'NEXT_PAGE' }))
    .build(),
    
  PageBuilder.create<AppState>('confirm', 'Confirm')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(colorify.bold('✅ Confirmation'));
      
      const confirmed = await cli.confirm(`Hello ${state.name}, continue?`);
      state.confirmed = confirmed;
    })
    .handleKey(() => null)
    .getNextAction((state) => 
      state.confirmed ? { type: 'EXIT' } : { type: 'PREV_PAGE' }
    )
    .build(),
];

// Create and run the framework
const framework = new InterShellFramework(
  { name: '', confirmed: false }, // Initial state
  pages,
  {} // Reducers (empty for simple state updates)
);

const finalState = await framework.run();
console.log('Final state:', finalState);
```

## 🎯 Core Concepts

### Pages
Pages are the building blocks of your CLI application. Each page handles a specific part of your workflow:

```typescript
const page = PageBuilder.create<State>('page-id', 'Page Title')
  .description('What this page does')
  .render(async (cli, state) => {
    // Render the page content
    // Use cli.prompt(), cli.select(), cli.confirm() for user input
  })
  .handleKey((key, state) => {
    // Handle raw key presses (optional)
    return null; // or return an action
  })
  .getNextAction((state) => {
    // Determine what happens next
    return { type: 'NEXT_PAGE' }; // or other actions
  })
  .build();
```

### State Management
For complex applications, use actions and reducers:

```typescript
type Action = 
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_AGE'; payload: number };

const reducers = {
  SET_NAME: (state: State, action: Action): State => ({
    ...state,
    name: (action as any).payload,
  }),
  SET_AGE: (state: State, action: Action): State => ({
    ...state,
    age: (action as any).payload,
  }),
};

// In your page render function:
return { type: 'SET_NAME', payload: name };
```

### Navigation Actions
Control page flow with navigation actions:

- `{ type: 'NEXT_PAGE' }` - Go to the next page
- `{ type: 'PREV_PAGE' }` - Go to the previous page  
- `{ type: 'CHANGE_PAGE'; payload: 'page-id' }` - Go to a specific page
- `{ type: 'RE_RENDER' }` - Re-render the current page
- `{ type: 'EXIT' }` - Exit the application
- `{ type: 'CUSTOM'; payload: action }` - Dispatch a custom action

## 🎨 Enhanced Colors

InterShell includes a powerful color system:

```typescript
import { colorify } from '../core';

// Basic colors
console.log(colorify.red('Error message'));
console.log(colorify.green('Success message'));
console.log(colorify.blue('Info message'));

// Styles
console.log(colorify.bold('Bold text'));
console.log(colorify.italic('Italic text'));
console.log(colorify.underline('Underlined text'));

// Advanced colors
console.log(colorify.rgb(255, 128, 0)('Custom RGB color'));
console.log(colorify.hex('#ff8000')('Hex color'));
console.log(colorify.hsl(30, 1, 0.5)('HSL color'));

// Effects
console.log(colorify.gradient(['#ff0000', '#00ff00', '#0000ff'])('Gradient text'));
console.log(colorify.rainbow('Rainbow text'));
```

## 🔧 Script Creation

Create type-safe CLI scripts with WrapShell:

```typescript
import { WrapShell, validators } from '../core';

const script = WrapShell.createScript({
  name: 'My CLI Tool',
  description: 'A sample CLI application',
  usage: 'my-tool [options]',
  examples: ['my-tool --name John --age 25'],
  options: [
    {
      short: '-n',
      long: '--name',
      description: 'Your name',
      required: true,
      validator: validators.nonEmpty,
    },
    {
      short: '-a',
      long: '--age',
      description: 'Your age',
      required: false,
      defaultValue: '0',
      validator: validators.integer,
    }
  ]
}, async (args, console) => {
  console.log(`Hello, ${args.name}! You are ${args.age} years old.`);
});

await script.run();
```

## 🧪 Testing

InterShell's architecture makes testing easy:

```typescript
import { PageBuilder } from '@intershell/interactive';
import { describe, it, expect } from 'vitest';

describe('My Page', () => {
  it('should update state correctly', () => {
    const page = PageBuilder.create('test', 'Test Page')
      .render(async (cli, state) => {
        state.value = 'updated';
      })
      .handleKey(() => null)
      .getNextAction(() => ({ type: 'NEXT_PAGE' }))
      .build();
      
    const state = { value: 'initial' };
    const mockCli = createMockCLI();
    
    await page.render(mockCli, state);
    expect(state.value).toBe('updated');
  });
});
```

## 🚀 Examples

Check out the examples in the `examples/` directory:

- **Simple Demo** - Basic page navigation and state management
- **Complex Form** - Multi-step form with validation
- **File Manager** - Interactive file browser
- **Git Helper** - Interactive git workflow tool

## 🏗️ Architecture

InterShell follows a clean architecture with clear separation of concerns:

```
┌─────────────────────┐
│   CLI Application   │
├─────────────────────┤
│  InterShell Framework │
├─────────────────────┤
│    Page System     │
├─────────────────────┤
│  Interactive CLI    │
├─────────────────────┤
│   Core Utilities    │
└─────────────────────┘
```

### Key Principles

1. **Event-Driven** - Clean event system for extensibility
2. **Immutable State** - Predictable state management
3. **Composable Pages** - Mix and match pages for different workflows
4. **Type Safety** - Full TypeScript support throughout
5. **Testability** - Easy to test individual components

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

InterShell is inspired by modern web frameworks and CLI tools, bringing the best patterns to interactive command-line applications.

---

**Built with ❤️ by the Monobun team**