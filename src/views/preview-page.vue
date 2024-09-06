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
            </div>
            <div id="right-panel">
                <h1>Summary</h1>
                <div>
                    <p id="summary"></p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    ref,
    onMounted,
    computed,
    nextTick,
    watch,
    defineComponent,
} from "vue";
// import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { PDFGraph } from "@/utils/exporter/treeExporter.js";
import svgIcon from "../components/ui/svg-icon.vue";

defineComponent({
    name: "PreviewPage",
});

// const route = useRoute();
// const router = useRouter();
const store = useStore();

const props = defineProps({
    exportData: Object,
    summaryData: Object,
});

const pdfGraph = ref(null);

// // get nodes and links data from store
// const pathData = computed(() => {
//     if (store.getters["passData/passData"]) {
//         try {
//             console.log("data", store.getters["passData/passData"]);
//             return store.getters["passData/passData"];
//         } catch (e) {
//             console.error("解析路由数据时出错:", e);
//             return null;
//         }
//     } else {
//         console.error("路由查询中没有数据");
//         return null;
//     }
// });

// // get summary data from store
// const summaryData = computed(() => {
//     console.log("summary: ", store.getters["passData/getSummary"]);
//     return store.getters["passData/getSummary"];
// });

// // back to mainPage
const goBack = () => {
    // router.back();
    // router.replace({ path: "/main" });
    const svg = d3.select("#main-svg");
    console.log("svg: ", svg);
    svg.remove();

    store.commit("changePage/setShowPage", true);
    store.commit("changePage/setExportDataReady", false);
};

// hover node related
const hoverNodeId = computed(() => store.getters["hoverSummary/id"]);
watch(hoverNodeId, (newVal, oldVal) => {
    const id = newVal || oldVal;

    console.log("hover related id: ", id);

    const sentence = d3.select("#summary").selectAll(`span.insight-node-${id}`);

    console.log("sentence: ", sentence);

    if (newVal) {
        sentence.classed("highlight", true);
    } else {
        sentence.classed("highlight", false);
    }
});

// lifeHook
onMounted(async () => {
    // const data = pathData.value;

    if (props.exportData) {
        const containerNode = d3.select("#svg-content").node();

        console.log("pathData Proxy: ", props.exportData);

        pdfGraph.value = new PDFGraph(props.exportData, store);
        // console.log("PDFGraph 初始化成功");
        await pdfGraph.value.createGraph(containerNode);
        // console.log("图表创建成功");

        console.log("summaryData: ", props.summaryData); // recall

        const summaryContent = `${props.summaryData.summary}`;
        const summarySentence = d3.select("#summary").html(summaryContent); // recall

        // const tempContent = `<span class="14">The user's exploration journey began with an interest in understanding why PlayStation 4 (PS4) sales were so high and whether other companies also had dominant brands.</span> <span class="insight-node-2">The user discovered that the sale of PS4 dominates among all brands for Sony.</span> <span class="insight-edge-2-3">This dominance of PS4 sales sparked curiosity about the sales patterns of other companies, leading to further exploration.</span>

        // <span class="insight-node-4">The user then turned their attention to Microsoft, noticing that unlike Sony and Nintendo, Microsoft did not have a dominant brand.</span> <span class="insight-node-5">The user discovered that the sale of the year 2014 was an outlier for Microsoft, significantly higher than other years.</span> <span class="insight-edge-5-6">This anomaly in sales data led the user to investigate the reasons behind these anomalies, which might include market conditions, product launches, or other factors.</span> <span class="insight-node-7">This insight helped the user understand the temporal distribution of sales and identify any unusual patterns that could explain high sales figures.</span>

        // <span class="insight-node-8">In addition to temporal distribution, the user also explored the geographical distribution of sales.</span> <span class="insight-node-9">The user found that the sale of North America dominates among all locations for Microsoft.</span> <span class="insight-node-10">This insight provided a comparison point for regional dominance, allowing the user to compare this with Nintendo's regional sales to see if there were similar patterns of dominance.</span>

        // <span class="insight-node-11">The user's exploration of Microsoft's sales continued, focusing on the declining sales year by year.</span> <span class="insight-node-12">The user discovered that the sale of North America dominates among all locations for the Xbox One.</span> <span class="insight-edge-12-13">This insight provided a geographical context to the sales data, leading to further investigation into market-specific factors that might be contributing to the decline in sales.</span>

        // <span class="insight-node-14">The user also discovered a clear downward trend in sales from 2013 to 2020 for the Xbox 360.</span> <span class="insight-node-15">This insight provided a temporal context and showed that the decline was not just a short-term anomaly but a long-term trend.</span> <span class="insight-node-16">This insight helped the user understand the broader pattern of declining sales over the years, which was crucial for addressing the question of why Microsoft's sales were declining.</span>

        // <span class="insight-node-17">The user then compared the sales trends of Sony and Microsoft, finding that the sale of Europe, Japan, North America, and other locations are correlated for Sony.</span> <span class="insight-node-18">This comparison was crucial for understanding the competitive landscape and how both companies' sales trends are correlated across different regions.</span>

        // <span class="insight-node-19">The user's exploration of Microsoft's sales in Europe revealed a clear downward trend over the years from 2013 to 2020.</span> <span class="insight-node-20">This insight helped in understanding the long-term trend and how the specific patterns observed fit into the overall decline.</span> <span class="insight-node-21">The user also found that the sale of the year 2020 was an outlier, significantly lower than other years.</span> <span class="insight-node-22">Understanding the outlier nature of 2020 provided deeper insights into why the sales pattern deviated so drastically, which was crucial for identifying anomalies and their impact on overall sales trends.</span>

        // <span class="insight-node-23">In conclusion, the user's exploration journey through the insight tree revealed significant insights about the dominance of PS4 sales for Sony, the declining sales of Microsoft, and the correlation of sales trends between Sony and Microsoft.</span> <span class="insight-node-24">The user was able to understand the temporal and geographical distribution of sales, identify anomalies, and compare the performance of different companies.</span> <span class="insight-node-25">This exploration process highlighted the importance of understanding the various factors that can influence sales, such as market conditions, product launches, and competition.</span>`;
        // const tempSentence = d3.select("#summary").html(tempContent); // delete

        const svg = d3.select("#main-svg");
        console.log("svg:", svg);

        // 使用 nextTick 确保 DOM 更新后再添加事件监听
        nextTick(() => {
            summarySentence
                .selectAll("span")
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut); // recall

            // tempSentence
            //     .selectAll("span")
            //     .on("mouseover", handleMouseOver)
            //     .on("mouseout", handleMouseOut); // delete
        });
    }

    // const svg = d3.select("#main-svg");
    // console.log("svg: ", svg);

    // const spanHighlighter = summarySentence
    //     .selectAll("span")
    //     .on("mouseover", handleMouseOver)
    //     .on("mouseout", handleMouseOut);

    function handleMouseOver(event) {
        // select hovered sentence
        const sentence = d3.select(event.currentTarget);

        // get hovered sentence class attribute value
        const sentenceClasses = sentence.attr("class");

        if (!sentenceClasses) {
            return;
        }
        const sentenceClassesArr = sentenceClasses.split(" ");
        const coNodeId = sentenceClassesArr.find((className) =>
            className.startsWith("insight-node-")
        );

        if (coNodeId) {
            sentence.classed("highlight", true);
        }

        const svg = d3.select("#main-svg");
        const nodeList = svg.select(".top-g-node").selectChildren(".node");
        const nodeElement = nodeList.filter((node) => {
            return `insight-node-${node.data.id}` === coNodeId;
        });

        if (nodeElement.node()) {
            toggleHover(nodeElement, true);
        }
    }

    function handleMouseOut(event) {
        const sentence = d3.select(event.currentTarget);

        const sentenceClasses = sentence.attr("class");

        if (!sentenceClasses) {
            return;
        }

        const sentenceClassesArr = sentenceClasses.split(" ");
        const coNodeId = sentenceClassesArr.find((className) =>
            className.startsWith("insight-node-")
        );

        if (coNodeId) {
            sentence.classed("highlight", false);
        }

        const svg = d3.select("#main-svg");

        const nodeList = svg.select(".top-g-node").selectChildren(".node");

        const nodeElement = nodeList.filter((node) => {
            return `insight-node-${node.data.id}` === coNodeId;
        });

        if (nodeElement.node()) {
            toggleHover(nodeElement, false);
        }
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
});
</script>

<style lang="scss">
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
            // &:hover {
            //     fill: $secondary-color;
            //     background-color: $background-color-dark;
            // }
        }
    }

    #svg-content {
        height: 100%;
    }
    .content-box {
        height: 95%;
        width: 100%;
        display: flex;

        .highlight {
            background-color: yellow; /* 高亮效果 */
        }
    }
}

.sentence {
    margin: 40px 0;
    cursor: pointer;
    /* font-size: 100px; */
}
</style>
