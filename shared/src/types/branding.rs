#[macro_export]
macro_rules! branded_u32 {
    ($name:ident) => {
        #[derive(Reflect, Serialize, Deserialize, Clone, PartialEq, Eq, Hash, Debug)]
        pub struct $name(pub u32);

        impl $name {
            pub fn new(value: u32) -> Self {
                Self(value.clone())
            }
        }

        impl std::ops::Deref for $name {
            type Target = u32;

            fn deref(&self) -> &u32 {
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
                Self(value.clone() as u32)
            }
        }

        impl From<u32> for $name {
            fn from(value: u32) -> Self {
                Self(value.clone())
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
        impl From<$name> for u32 {
            fn from(value: $name) -> u32 {
                value.0
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