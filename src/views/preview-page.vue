<template>
    <div class="container">
        <div class="nav-bar">
            <div class="brand">Preview SVG Container</div>
            <div style="flex-grow: 1"></div>
            <div>
                <SvgIcon iconName="home" class="icon" @click="goBack"></SvgIcon>
            </div>
        </div>
        <div class="content-box">
            <div id="left-panel">
                <!-- <h1>Preview SVG Container</h1> -->
                <div id="svg-content"></div>
                <!-- 返回按钮 -->
                <!-- <button @click="goBack" class="return-button">返回主页</button> -->
            </div>
            <div id="right-panel">
                <h1>Summary</h1>
                <!-- <h1>随机文本</h1> -->
                <!-- <div>
                    <p>
                        <span class="sentence" data-node-id="node-85"
                            >这是第一句话。</span
                        ><span class="sentence" data-node-id="node-51"
                            >这是第二句话，包含了一些单词。</span
                        ><span class="sentence" data-node-id="node-52"
                            >这是第三句话，其中也有一些单词。</span
                        >
                        继续添加其他句子
                    </p>
                </div> -->
                <!-- <h1>Summary</h1> -->
                <p id="summary" v-html="summaryContent"></p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { PDFGraph } from "@/utils/exporter/treeExporter.js";

const route = useRoute();
const router = useRouter();
const store = useStore();

// get nodes and links data from store
const pathData = computed(() => {
    if (store.getters["passData/passData"]) {
        try {
            console.log("data", store.getters["passData/passData"]);
            return store.getters["passData/passData"];
            // console.log("data", JSON.parse(store.getters["passData/passData"]));
            // return JSON.parse(store.getters["passData/passData"]);
        } catch (e) {
            console.error("解析路由数据时出错:", e);
            return null;
        }
    } else {
        console.error("路由查询中没有数据");
        return null;
    }
});

// get summary data from store
const summaryData = computed(() => {
    console.log("summary: ", store.getters["passData/getSummary"]);
    return store.getters["passData/getSummary"];
});

// back to mainPage
const goBack = () => {
    router.back();
    // router.replace({ path: "/main" });
};

// lifeHook
onMounted(async () => {
    // console.log("onMounted 钩子触发");

    // console.log("pathData: ", pathData);
    const data = pathData.value;
    // console.log("onMounted 中解析的数据:", data);

    // if (!data || typeof data !== "object" || !data.nodes || !data.links) {
    //     console.error("无效的数据:", data);
    //     return;
    // }

    const containerNode = d3.select("#svg-content").node();
    // if (!containerNode) {
    //     console.error("未找到容器节点");
    //     return;
    // }

    try {
        const pdfGraph = new PDFGraph(data);
        console.log("PDFGraph 初始化成功");
        pdfGraph.createGraph(containerNode);
        console.log("图表创建成功");
    } catch (error) {
        console.error("创建图表时出错:", error);
    }

    const summaryContent = `${summaryData.value}`;
    const summarySentence = d3.select("#summary").html(summaryContent);

    // 使用 nextTick 确保 DOM 更新后再添加事件监听
    nextTick();

    // Select all elements with class "sentence"
    const sentences = d3.selectAll(".sentence");

    // console.log("sentences: ", sentences);

    // Add event listeners for mouseover and mouseout
    sentences.on("mouseover", handleMouseOver).on("mouseout", handleMouseOut);

    function handleMouseOver(event) {
        // console.log("MouseOver");
        const sentence = d3.select(event.currentTarget);
        const coNodeId = sentence.attr("data-node-id");
        const svg = d3.select("#main-svg");

        if (!svg.node()) {
            console.log("svg is null");
        }

        // console.log("svg: ", svg);

        const nodeList = svg.select(".top-g-node").selectChildren(".node");

        // console.log("nodeList:", nodeList);
        // console.log(`${coNodeId}`);

        const nodeElement = nodeList.filter((node) => {
            // console.log(`node: node-${node.data.id}`);
            return `node-${node.data.id}` === coNodeId;
        });

        console.log("nodeElement: ", nodeElement);

        if (nodeElement.node()) {
            // nodeElement.classed("highlight-node", true);
            // nodeElement.style("transform") + " scale(1.1)";
            toggleHover(nodeElement, true);
        }

        sentence.classed("highlight", true);
    }

    function handleMouseOut(event) {
        const sentence = d3.select(event.currentTarget);
        const coNodeId = sentence.attr("data-node-id");
        const svg = d3.select("#main-svg");

        if (!svg.node()) {
            console.log("svg is null");
        }

        // console.log("svg: ", svg);

        const nodeList = svg.select(".top-g-node").selectChildren(".node");

        console.log("nodeList:", nodeList);
        const nodeElement = nodeList.filter((node) => {
            return `node-${node.data.id}` === coNodeId;
        });

        if (nodeElement.node()) {
            // nodeElement.classed("highlight-node", false);
            // nodeElement.style("transform").split("scale")[0];
            toggleHover(nodeElement, false);
        }

        sentence.classed("highlight", false);
    }

    function toggleHover(nodeG, state, duration = 200) {
        let transformStr = "";
        let scale = 1.1;
        if (state) {
            transformStr = nodeG.style("transform") + ` scale(${scale})`;
        } else {
            transformStr = nodeG.style("transform").split("scale")[0];
        }
        nodeG.transition().duration(duration).style("transform", transformStr);
    }

    // 为句子添加鼠标悬停事件监听
    // const sentences = document.querySelectorAll(".sentence");
    // sentences.forEach((sentence) => {
    //     sentence.addEventListener("mouseover", handleMouseOver);
    //     sentence.addEventListener("mouseout", handleMouseOut);
    // });

    //     function handleMouseOver(event) {
    //         const sentence = event.currentTarget;
    //         const coNodeId = sentence.getAttribute("data-node-id"); // 假设每个句子都有一个data-node-id属性
    //         const nodeElement = document.getElementById(coNodeId);
    //         if (nodeElement) {
    //             nodeElement.classList.add("highlight-node");
    //             // 如果边也需要高亮，可以通过coNodeId查找相关边并高亮
    //         }
    //         sentence.classList.add("highlight");
    //     }

    //     function handleMouseOut(event) {
    //         const sentence = event.currentTarget;
    //         const coNodeId = sentence.getAttribute("data-node-id");
    //         const nodeElement = document.getElementById(coNodeId);
    //         if (nodeElement) {
    //             nodeElement.classList.remove("highlight-node");
    //         }
    //         sentence.classList.remove("highlight");
    //     }
    // });
    // window.addEventListener("DOMContentLoaded", (event) => {
    //     const sentences = document.querySelectorAll(".sentence");

    //     sentences.forEach((sentence) => {
    //         sentence.addEventListener("mouseover", () => {
    //             sentence.classList.add("highlight");
    //         });

    //         sentence.addEventListener("mouseout", () => {
    //             sentence.classList.remove("highlight");
    //         });
    //     });
    // });
});
</script>

<style lang="scss" scoped>
.container {
    @include container-base();
    @include flex-box(column);
    max-height: 100%;
    // gap: 0.5rem;

    .nav-bar {
        flex: auto;
        width: 100%;
        height: 5%;
        box-shadow: 0rem 0.2rem 0.3rem 0rem rgba(0, 0, 0, 0.2);
        z-index: $z-top-absolute;
        @include flex-box();
        align-items: center;
        padding-left: 1rem;
        background-color: $background-color-light;
        .brand {
            font-size: 2rem;
            font-weight: bold;
            color: $primary-color;
        }
        .icon {
            @include icon-style($icon-size-small);
            background-color: transparent !important;
            margin-right: 6px;
            &:hover {
                fill: $secondary-color;
                background-color: $background-color-dark;
            }
        }
    }

    .content-box {
        height: 95%;
        width: 100%;
        display: flex;
    }
}

// // #container {
// //     display: flex;
// //     margin: 20px;
// // }

// // #left-panel {
// //     flex: 1;
// //     margin-right: 0px; /* 左右面板之间的空间 */
// // }

// // #right-panel {
// //     flex: 1;
// //     background-color: #f0f0f0; /* 可选: 添加背景颜色 */
// //     padding: 20px; /* 可选: 添加内边距 */
// // }

// #svg-content {
//     width: 100%;
//     height: auto;
// }

// .return-button {
//     margin-top: 20px;
//     padding: 10px 20px;
//     background-color: #007bff;
//     color: #fff;
//     border: none;
//     border-radius: 5px;
//     cursor: pointer;
// }

// .return-button:hover {
//     background-color: #0056b3;
// }

.sentence {
    margin: 40px 0;
    cursor: pointer;
    /* font-size: 100px; */
}
.highlight {
    background-color: yellow; /* 高亮效果 */
}

/* .highlight-node {
    transform: scale(1.2); // 放大节点
    } */
</style>
