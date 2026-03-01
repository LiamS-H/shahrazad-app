#[macro_export]
macro_rules! branded_usize {
    ($name:ident) => {
        #[derive(Reflect, Serialize, Deserialize, Clone, PartialEq, Eq, Hash, Debug)]
        pub struct $name(pub usize);

        impl $name {
            pub fn new(value: usize) -> Self {
                Self(value.clone())
            }
        }

        impl std::ops::Deref for $name {
            type Target = usize;

            fn deref(&self) -> &usize {
                &self.0
            }
        }

        impl std::fmt::Display for $name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "{}", self.0)
            }
        }

        impl From<usize> for $name {
            fn from(value: usize) -> Self {
                Self(value.clone())
            }
        }
        impl From<u32> for $name {
            fn from(value: u32) -> Self {
                if let Ok(out) = value.try_into() {
                    return Self(out);
                };
                return Self(0);
            }
        }
        impl From<i32> for $name {
            fn from(value: i32) -> Self {
                if let Ok(out) = value.try_into() {
                        return Self(out);
                };
                return Self(0);
            }
        }
        impl From<$name> for usize {
            fn from(value: $name) -> usize {
                value.0
            }
        }
        impl From<$name> for u32 {
            fn from(value: $name) -> u32 {
                if let Ok(out) = TryInto::<u32>::try_into(value.0) {
                    return out;
                };
                return 0;
            }
        }
    };
}

#[macro_export]
macro_rules! branded_string {
    ($name:ident) => {
        #[derive(Reflect, Serialize, Deserialize, Clone, PartialEq, Eq, Hash, Debug)]
        pub struct $name(String);

        impl $name {
            pub fn new(value: String) -> Self {
                Self(value.clone())
            }
        }

        impl std::ops::Deref for $name {
            type Target = str;

            fn deref(&self) -> &str {
                &self.0
            }
        }

        impl std::fmt::Display for $name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "{}", self.0)
            }
        }

        impl From<String> for $name {
            fn from(value: String) -> Self {
                Self(value.clone())
            }
        }

        impl From<&str> for $name {
            fn from(value: &str) -> Self {
                Self(value.to_string())
            }
        }
        impl From<$name> for String {
            fn from(value: $name) -> String {
                value.0
            }
        }
    };
}