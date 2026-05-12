export const testRunners = {
  python: `
import json
if __name__ == "__main__":
    cases = [
        {"input": ([2,7,11,15], 9), "expected": [0,1], "hidden": False, "name": "Test Case 1"},
        {"input": ([3,2,4], 6), "expected": [1,2], "hidden": False, "name": "Test Case 2"},
        {"input": ([3,3], 6), "expected": [0,1], "hidden": False, "name": "Test Case 3"},
        {"input": ([2,3,4], 6), "expected": [0,2], "hidden": True, "name": "Hidden Test Case 1"},
        {"input": ([10,20,30,40], 70), "expected": [2,3], "hidden": True, "name": "Hidden Test Case 2"}
    ]
    for c in cases:
        try:
            out = twoSum(c["input"][0], c["input"][1])
            passed = (out == c["expected"])
            print(f"###TC###{c['name']}###{'PASS' if passed else 'FAIL'}###{json.dumps(out)}###{json.dumps(c['expected'])}###{'HIDDEN' if c['hidden'] else 'PUBLIC'}###")
        except Exception as e:
            print(f"###TC###{c['name']}###ERROR###{str(e)}###{json.dumps(c['expected'])}###{'HIDDEN' if c['hidden'] else 'PUBLIC'}###")
`,
  cpp: `
#include <iostream>
#include <vector>
#include <string>

std::string vecToStr(const std::vector<int>& v) {
    std::string s = "[";
    for(size_t i=0; i<v.size(); ++i){
        s += std::to_string(v[i]) + (i<v.size()-1 ? "," : "");
    }
    s += "]";
    return s;
}

int main() {
    Solution sol;
    struct TestCase {
        std::vector<int> nums;
        int target;
        std::vector<int> expected;
        bool hidden;
        std::string name;
    };
    
    std::vector<TestCase> cases = {
        {{2,7,11,15}, 9, {0,1}, false, "Test Case 1"},
        {{3,2,4}, 6, {1,2}, false, "Test Case 2"},
        {{3,3}, 6, {0,1}, false, "Test Case 3"},
        {{2,3,4}, 6, {0,2}, true, "Hidden Test Case 1"},
        {{10,20,30,40}, 70, {2,3}, true, "Hidden Test Case 2"}
    };
    
    for(auto& c : cases) {
        try {
            std::vector<int> out = sol.twoSum(c.nums, c.target);
            bool passed = (out == c.expected);
            std::cout << "###TC###" << c.name << "###" << (passed ? "PASS" : "FAIL") 
                      << "###" << vecToStr(out) << "###" << vecToStr(c.expected) 
                      << "###" << (c.hidden ? "HIDDEN" : "PUBLIC") << "###\\n";
        } catch(const std::exception& e) {
            std::cout << "###TC###" << c.name << "###ERROR###" << e.what() << "###" 
                      << vecToStr(c.expected) << "###" << (c.hidden ? "HIDDEN" : "PUBLIC") << "###\\n";
        } catch(...) {
            std::cout << "###TC###" << c.name << "###ERROR###Unknown Error###" 
                      << vecToStr(c.expected) << "###" << (c.hidden ? "HIDDEN" : "PUBLIC") << "###\\n";
        }
    }
    return 0;
}
`,
  java: `
class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        Object[][] cases = {
            {new int[]{2,7,11,15}, 9, new int[]{0,1}, false, "Test Case 1"},
            {new int[]{3,2,4}, 6, new int[]{1,2}, false, "Test Case 2"},
            {new int[]{3,3}, 6, new int[]{0,1}, false, "Test Case 3"},
            {new int[]{2,3,4}, 6, new int[]{0,2}, true, "Hidden Test Case 1"},
            {new int[]{10,20,30,40}, 70, new int[]{2,3}, true, "Hidden Test Case 2"}
        };
        
        for(Object[] c : cases) {
            try {
                int[] nums = (int[]) c[0];
                int target = (int) c[1];
                int[] expected = (int[]) c[2];
                boolean hidden = (boolean) c[3];
                String name = (String) c[4];
                
                int[] out = sol.twoSum(nums, target);
                boolean passed = java.util.Arrays.equals(out, expected);
                System.out.println("###TC###" + name + "###" + (passed ? "PASS" : "FAIL") + 
                    "###" + java.util.Arrays.toString(out).replaceAll(" ", "") + "###" + java.util.Arrays.toString(expected).replaceAll(" ", "") + 
                    "###" + (hidden ? "HIDDEN" : "PUBLIC") + "###");
            } catch(Exception e) {
                boolean hidden = (boolean) c[3];
                String name = (String) c[4];
                int[] expected = (int[]) c[2];
                System.out.println("###TC###" + name + "###ERROR###" + e.toString() + 
                    "###" + java.util.Arrays.toString(expected).replaceAll(" ", "") + "###" + (hidden ? "HIDDEN" : "PUBLIC") + "###");
            }
        }
    }
}
`
};

export const wandboxLanguageMap = {
  python: 'cpython-3.10.15',
  cpp: 'gcc-head',
  java: 'openjdk-jdk-22+36'
};
