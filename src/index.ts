
module FamilyTreePlotter {
    enum Relation {
        Partner,
        Parent,
        Child,
        Sibling
    }

    class Canvas {

        public container: d3.Selection<"g">;

        constructor(rootElemPath: string) {
            let zoom = d3.behavior.zoom()
                .scaleExtent([1, 10])
                .on("zoom", () => this.onZoom());

            let svg = d3.select("body").append("svg")
                .attr("width", 1200)
                .attr("height", 600);

            let background = svg.append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "#F2EEE4")
                .style("pointer-events", "all")
                .style("cursor", "grab")
                .call(zoom);

            this.container = svg.append("g")
                .style("vector-effect", "non-scaling-stroke");
        }

        private onZoom() {
            let evt = d3.event as d3.ZoomEvent;
            this.container.attr("transform", "translate(" + evt.translate + ")scale(" + evt.scale + ")");
        }
    }


    class Person {

        public x: number;
        public y: number;

        public relatives = {
            mother: null,
            father: null,
            children: [],
            partners: []
        };

        public connectionLine?: d3.Selection<"g">;;

        public static canvas: Canvas;

        private static props = {
            width: 250,
            height: 120,
            siblingSpace: 60,
            cornerRadious: 20,
            colors: {
                man: {
                    background: "rgb(159, 213, 235)",
                    stroke: "rgb(142, 191, 211)"
                },
                woman: {
                    background: "rgb(245, 184, 219)",
                    stroke: "rgb(214, 161, 191)"
                }
            },
            menColor: "rgb(159, 213, 235)",
            menStrokeColor: "rgb(142, 191, 211)",
            womenColor: "rgb(245, 184, 219)",
            womenStrokeColor: "rgb(214, 161, 191)"
        }

        constructor(relative?: Person, relation?: Relation, isWoman = false) {
            this.x = 100;
            this.y = 100;

            this.setCoords(relative, relation);
            this.drawBox(isWoman);
        }

        private drawBox(isWoman: boolean) {
            let colors = Person.props.colors[isWoman ? "woman" : "man"];
            Person.canvas.container.append('rect')
                .attr("x", this.x)
                .attr("y", this.y)
                .attr("rx", Person.props.cornerRadious)
                .attr("ry", Person.props.cornerRadious)
                .attr("width", Person.props.width)
                .attr("height", Person.props.height)
                .attr("fill", colors.background)
                .attr("stroke-width", 1.5)
                .attr("stroke", colors.stroke);
        }

        private setCoords(relative?: Person, relation?: Relation) {

            if (relative) {
                switch (relation) {
                    case Relation.Sibling:
                        this.x = relative.x + Person.props.width + Person.props.siblingSpace;
                        this.y = relative.y;
                        break;
                }

                this.connectWith(relative, relation);
            }
        }

        private connectWith(relative: Person, relation?: Relation) {

            let relTopCenter = relative.x + Person.props.width / 2;
            var path = new Path(relTopCenter, relative.y).arcTo(30, -30, 30, 30).lineTo(this.x + Person.props.width / 2 - 30, null, false).arcTo(30, 30, 30, 30).getPath();

            this.connectionLine = relative.connectionLine = Person.canvas.container.append("path")
                .attr("d", path)
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("stroke-opacity", 0.3)
                .attr("fill", "none");
        }
    }


    class Path {
        public path = "";
        private currentPos = {
            x: 0,
            y: 0
        }
        constructor(x: number, y: number) {
            this.setCurrentPos(x, y, false);
            this.path += `M ${x} ${y}`;
        }

        public lineTo(x: number | null, y: number | null, isRelative = true) {
            this.setCurrentPos(x, y, isRelative);
            this.path += `L ${this.currentPos.x} ${this.currentPos.y}`;
            return this;
        }

        public arcTo(x: number | null, y: number | null, rx: number, ry: number, isRelative = true) {
            this.setCurrentPos(x, y, isRelative);
            this.path += `A ${rx} ${ry} 0 0 1 ${this.currentPos.x} ${this.currentPos.y}`;
            return this;
        }

        private setCurrentPos(toX: number | null, toY: number | null, isRelative = true) {
            if (toX == null) {
                toX = this.currentPos.x;
            }

            if (toY == null) {
                toY = this.currentPos.y;
            }

            if (isRelative) {
                this.currentPos.x += toX;
                this.currentPos.y += toY;
            }
            else {
                this.currentPos.x = toX;
                this.currentPos.y = toY;
            }
        }

        getPath() {
            return this.path;
        }
    }

    interface IPersonData {
        id: number,
        fname?: string,
        sname?: string,
        sex: "m" | "f",
        mother?: number,
        father?: number
    }

    let data: IPersonData[] = [
        { id: 1, fname: "Max", sname: "Wroc", mother: 2, father: 3, sex: "m" },
        { id: 2, fname: "Halina", sname: "Wroc", sex: "f" },
        { id: 3, fname: "Norbert", sname: "Wroc", sex: "m" },
        { id: 4, fname: "Amadeusz", sname: "Wroc", mother: 6, father: 1, sex: "m" },
        { id: 5, fname: "Artur", sname: "Wroc", mother: 6, father: 1, sex: "m" },
        { id: 6, fname: "Magdalena", sname: "Wroc", sex: "f" },
    ];


    window.addEventListener("load", () => {
        Person.canvas = new Canvas("body");

        let me = new Person();
        let sister = new Person(me, Relation.Sibling, true);
        let parent = new Person(me, Relation.Parent, true);

        // convert db
        let assocData = data.reduce((acc, curr) => { acc[curr.id] = curr; return acc; }, {} as { [key: number]: IPersonData });
    });


}